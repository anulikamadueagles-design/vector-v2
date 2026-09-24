const express = require('express');
const path = require('path');
const fs = require('fs');
const PDFDocument = require('pdfkit');
const { Document, Packer, Paragraph, HeadingLevel } = require('docx');
const pptxgen = require('pptxgenjs');

const router = express.Router();

const EXPORT_DIR = path.join(__dirname, '../../exports');

if (!fs.existsSync(EXPORT_DIR)) {
  fs.mkdirSync(EXPORT_DIR, { recursive: true });
}

function safeName(value) {
  return String(value || 'vector-document')
    .replace(/[^a-z0-9-_]/gi, '-')
    .toLowerCase()
    .slice(0, 80);
}

function lines(text) {
  return String(text || '')
    .split(/\r?\n/)
    .map(x => x.trim())
    .filter(Boolean);
}

/* PDF */
router.post('/pdf', async (req, res) => {
  const {
    title = 'VECTOR Education Material',
    content = ''
  } = req.body || {};

  if (!content) {
    return res.status(400).json({ error: 'content is required' });
  }

  const filename = `${safeName(title)}-${Date.now()}.pdf`;
  const output = path.join(EXPORT_DIR, filename);

  const doc = new PDFDocument({
    margin: 50
  });

  const stream = fs.createWriteStream(output);

  doc.pipe(stream);

  doc.fontSize(20).text(title);
  doc.moveDown();

  for (const line of lines(content)) {
    doc.fontSize(11).text(line);
    doc.moveDown(0.35);
  }

  doc.end();

  stream.on('finish', () => {
    res.json({
      ok: true,
      type: 'pdf',
      filename,
      download: `/exports/${filename}`
    });
  });
});

/* Word */
router.post('/word', async (req, res) => {
  const {
    title = 'VECTOR Education Material',
    content = ''
  } = req.body || {};

  if (!content) {
    return res.status(400).json({ error: 'content is required' });
  }

  const filename = `${safeName(title)}-${Date.now()}.docx`;
  const output = path.join(EXPORT_DIR, filename);

  const children = [
    new Paragraph({
      text: title,
      heading: HeadingLevel.TITLE
    })
  ];

  for (const line of lines(content)) {
    children.push(
      new Paragraph({
        text: line
      })
    );
  }

  const document = new Document({
    sections: [
      {
        properties: {},
        children
      }
    ]
  });

  const buffer = await Packer.toBuffer(document);
  fs.writeFileSync(output, buffer);

  res.json({
    ok: true,
    type: 'word',
    filename,
    download: `/exports/${filename}`
  });
});

/* PowerPoint */
router.post('/powerpoint', async (req, res) => {
  const {
    title = 'VECTOR Education Presentation',
    content = '',
    slides = []
  } = req.body || {};

  const filename = `${safeName(title)}-${Date.now()}.pptx`;
  const output = path.join(EXPORT_DIR, filename);

  const pptx = new pptxgen();

  pptx.author = 'VECTOR Education Studio';
  pptx.subject = title;
  pptx.title = title;
  pptx.company = "Vector's Element Tech";
  pptx.lang = 'en-US';

  if (Array.isArray(slides) && slides.length) {
    for (const item of slides) {
      const slide = pptx.addSlide();

      slide.addText(String(item.title || 'Untitled Slide'), {
        x: 0.6,
        y: 0.5,
        w: 12,
        h: 0.7,
        fontSize: 24,
        bold: true
      });

      slide.addText(
        Array.isArray(item.bullets)
          ? item.bullets.map(x => `• ${x}`).join('\n')
          : String(item.content || ''),
        {
          x: 0.8,
          y: 1.4,
          w: 11.5,
          h: 4.8,
          fontSize: 17,
          breakLine: false,
          valign: 'top'
        }
      );

      if (item.notes) {
        slide.addNotes(String(item.notes));
      }
    }
  } else {
    const slide = pptx.addSlide();

    slide.addText(title, {
      x: 0.7,
      y: 0.6,
      w: 11.5,
      h: 0.8,
      fontSize: 26,
      bold: true
    });

    slide.addText(content, {
      x: 0.8,
      y: 1.6,
      w: 11.2,
      h: 4.8,
      fontSize: 17,
      valign: 'top'
    });
  }

  await pptx.writeFile({
    fileName: output
  });

  res.json({
    ok: true,
    type: 'powerpoint',
    filename,
    download: `/exports/${filename}`
  });
});

module.exports = router;
