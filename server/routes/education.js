const express = require('express');
const router = express.Router();
const { callAI } = require('../lib/ai');
const fs = require('fs');
const path = require('path');

let pptxgen;
let PDFDocument;
let docx;

try {
  pptxgen = require('pptxgenjs');
} catch {}

try {
  PDFDocument = require('pdfkit');
} catch {}

try {
  docx = require('docx');
} catch {}

const DATA_DIR = path.join(__dirname, '..', '..', 'exports');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const memoryStore = {
  classes: [],
  students: [],
  attendance: [],
  progress: [],
  materials: []
};

async function generate(prompt, type, extra = {}) {
  const result = await callAI({
    model: process.env.AI_MODEL,
    messages: [
      {
        role: 'system',
        content: `
You are VECTOR Education Studio.

You help teachers, lecturers, students, schools,
universities, training centres and education teams.

Write naturally, clearly and professionally.

Never invent citations.
Never claim that a source was checked unless it was actually checked.
Use headings, bullets and numbered sections.
Make educational content practical and easy to teach or study.

Content should be ready to copy into notes,
lesson materials, assignments or documents.
`
      },
      {
        role: 'user',
        content: prompt
      }
    ]
  });

  return {
    ok: true,
    type,
    ...extra,
    content: result.content
  };
}

/* =====================================================
   EDUCATION OVERVIEW
===================================================== */

router.get('/', (req, res) => {
  res.json({
    ok: true,
    name: 'VECTOR Education Studio',
    version: '2.1.0',
    features: [
      'lesson-notes',
      'explain-topic',
      'lesson-plan',
      'presentation',
      'powerpoint-export',
      'pdf-export',
      'word-export',
      'marking-scheme',
      'grading-rubric',
      'question-paper',
      'quiz',
      'assignment',
      'curriculum',
      'attendance',
      'student-progress',
      'class-management',
      'student-management',
      'teaching-materials',
      'citation-assistance',
      'study-guide',
      'flashcards',
      'exam-preparation',
      'revision-notes',
      'case-study',
      'course-outline',
      'learning-objectives',
      'teacher-notes'
    ]
  });
});

/* =====================================================
   LESSON NOTES
===================================================== */

router.post('/lesson-notes', async (req, res) => {
  const {
    subject = '',
    topic = '',
    level = 'University',
    length = 'medium',
    audience = 'students'
  } = req.body || {};

  if (!subject || !topic) {
    return res.status(400).json({
      error: 'subject and topic are required'
    });
  }

  try {
    res.json(
      await generate(
        `
Create ${length} lesson notes.

Subject: ${subject}
Topic: ${topic}
Academic level: ${level}
Audience: ${audience}

Include:

1. Topic title
2. Learning objectives
3. Introduction
4. Key concepts
5. Detailed explanation
6. Practical examples
7. Applications
8. Important terms
9. Summary
10. Review questions
11. Short assignment

Make the material suitable for a teacher or lecturer
to copy, edit and teach from.
`,
        'lesson-notes',
        { subject, topic, level }
      )
    );
  } catch (e) {
    res.status(502).json({ error: e.message });
  }
});

/* =====================================================
   EXPLAIN TOPIC
===================================================== */

router.post('/explain', async (req, res) => {
  const {
    subject = '',
    topic = '',
    level = 'University',
    style = 'simple'
  } = req.body || {};

  if (!topic) {
    return res.status(400).json({
      error: 'topic is required'
    });
  }

  try {
    res.json(
      await generate(
        `
Explain this academic topic.

Subject: ${subject}
Topic: ${topic}
Level: ${level}
Style: ${style}

Start with a simple explanation.
Then build toward the academic explanation.

Use relatable examples.
Break difficult concepts into steps.
Define important terminology.
Include formulas where appropriate.

Finish with:
- concise recap
- three learner questions
- one practical example
`,
        'explanation',
        { subject, topic, level }
      )
    );
  } catch (e) {
    res.status(502).json({ error: e.message });
  }
});

/* =====================================================
   LESSON PLAN
===================================================== */

router.post('/lesson-plan', async (req, res) => {
  const {
    subject = '',
    topic = '',
    level = 'University',
    duration = '60 minutes'
  } = req.body || {};

  try {
    res.json(
      await generate(
        `
Create a professional lesson plan.

Subject: ${subject}
Topic: ${topic}
Level: ${level}
Duration: ${duration}

Include:

- lesson title
- learning objectives
- prerequisite knowledge
- teaching materials
- introduction
- teacher activities
- learner activities
- teaching methods
- guided practice
- independent practice
- assessment
- differentiation
- homework
- lesson summary
`,
        'lesson-plan',
        { subject, topic, level, duration }
      )
    );
  } catch (e) {
    res.status(502).json({ error: e.message });
  }
});

/* =====================================================
   PRESENTATION
===================================================== */

router.post('/presentation', async (req, res) => {
  const {
    subject = '',
    topic = '',
    level = 'University',
    slides = 10
  } = req.body || {};

  try {
    res.json(
      await generate(
        `
Create a ${slides}-slide teaching presentation.

Subject: ${subject}
Topic: ${topic}
Level: ${level}

For every slide provide:

- slide number
- title
- concise bullet points
- lecturer notes
- suggested visual

Make it suitable for PowerPoint.
`,
        'presentation',
        { subject, topic, level, slides }
      )
    );
  } catch (e) {
    res.status(502).json({ error: e.message });
  }
});

/* =====================================================
   MARKING SCHEME
===================================================== */

router.post('/marking-scheme', async (req, res) => {
  const {
    subject = '',
    topic = '',
    level = 'University',
    totalMarks = 100
  } = req.body || {};

  try {
    res.json(
      await generate(
        `
Create a detailed marking scheme.

Subject: ${subject}
Topic: ${topic}
Level: ${level}
Total marks: ${totalMarks}

Include:

- question-by-question allocation
- expected answers
- marking points
- partial-credit guidance
- common mistakes
- final total
`,
        'marking-scheme',
        { subject, topic, level, totalMarks }
      )
    );
  } catch (e) {
    res.status(502).json({ error: e.message });
  }
});

/* =====================================================
   GRADING RUBRIC
===================================================== */

router.post('/grading-rubric', async (req, res) => {
  const {
    subject = '',
    assignment = '',
    level = 'University'
  } = req.body || {};

  try {
    res.json(
      await generate(
        `
Create a professional grading rubric.

Subject: ${subject}
Assignment: ${assignment}
Level: ${level}

Include clear criteria and performance levels.
Use measurable descriptions.
Make it practical for teachers and lecturers.
`,
        'grading-rubric',
        { subject, assignment, level }
      )
    );
  } catch (e) {
    res.status(502).json({ error: e.message });
  }
});

/* =====================================================
   QUESTION PAPER
===================================================== */

router.post('/question-paper', async (req, res) => {
  const {
    subject = '',
    topics = '',
    level = 'University',
    questions = 10,
    marks = 100
  } = req.body || {};

  try {
    res.json(
      await generate(
        `
Generate an academic examination question paper.

Subject: ${subject}
Topics: ${topics}
Level: ${level}
Number of questions: ${questions}
Total marks: ${marks}

Use a professional examination structure.
Use suitable question types.
Do not include answers unless requested.
`,
        'question-paper',
        { subject, topics, level, questions, marks }
      )
    );
  } catch (e) {
    res.status(502).json({ error: e.message });
  }
});

/* =====================================================
   QUIZ
===================================================== */

router.post('/quiz', async (req, res) => {
  const {
    subject = '',
    topic = '',
    level = 'University',
    questions = 10
  } = req.body || {};

  try {
    res.json(
      await generate(
        `
Create a ${questions}-question educational quiz.

Subject: ${subject}
Topic: ${topic}
Level: ${level}

Use a mixture of:

- multiple choice
- short answer
- conceptual questions

Provide an answer key.
`,
        'quiz',
        { subject, topic, level, questions }
      )
    );
  } catch (e) {
    res.status(502).json({ error: e.message });
  }
});

/* =====================================================
   ASSIGNMENT
===================================================== */

router.post('/assignment', async (req, res) => {
  const {
    subject = '',
    topic = '',
    level = 'University'
  } = req.body || {};

  try {
    res.json(
      await generate(
        `
Create a student assignment.

Subject: ${subject}
Topic: ${topic}
Level: ${level}

Include:

- title
- learning objectives
- instructions
- questions/tasks
- submission requirements
- assessment criteria
`,
        'assignment',
        { subject, topic, level }
      )
    );
  } catch (e) {
    res.status(502).json({ error: e.message });
  }
});

/* =====================================================
   STUDY GUIDE
===================================================== */

router.post('/study-guide', async (req, res) => {
  const {
    subject = '',
    topics = '',
    level = 'University'
  } = req.body || {};

  try {
    res.json(
      await generate(
        `
Create a comprehensive study guide.

Subject: ${subject}
Topics: ${topics}
Level: ${level}

Include:

- key concepts
- definitions
- explanations
- examples
- likely examination areas
- revision checklist
- practice questions
`,
        'study-guide',
        { subject, topics, level }
      )
    );
  } catch (e) {
    res.status(502).json({ error: e.message });
  }
});

/* =====================================================
   FLASHCARDS
===================================================== */

router.post('/flashcards', async (req, res) => {
  const {
    subject = '',
    topic = '',
    level = 'University',
    count = 10
  } = req.body || {};

  try {
    res.json(
      await generate(
        `
Create ${count} concise study flashcards.

Subject: ${subject}
Topic: ${topic}
Level: ${level}

Format:

CARD 1
Front:
Back:

Keep the cards concise and accurate.
`,
        'flashcards',
        { subject, topic, level, count }
      )
    );
  } catch (e) {
    res.status(502).json({ error: e.message });
  }
});

/* =====================================================
   CURRICULUM
===================================================== */

router.post('/curriculum', async (req, res) => {
  const {
    subject = '',
    level = 'University',
    duration = '12 weeks'
  } = req.body || {};

  try {
    res.json(
      await generate(
        `
Create a complete curriculum plan.

Subject: ${subject}
Level: ${level}
Duration: ${duration}

Include:

- weekly topics
- learning outcomes
- activities
- assessments
- progression
- final learning outcomes
`,
        'curriculum',
        { subject, level, duration }
      )
    );
  } catch (e) {
    res.status(502).json({ error: e.message });
  }
});

/* =====================================================
   CASE STUDY
===================================================== */

router.post('/case-study', async (req, res) => {
  const {
    subject = '',
    topic = '',
    level = 'University'
  } = req.body || {};

  try {
    res.json(
      await generate(
        `
Create an educational case study.

Subject: ${subject}
Topic: ${topic}
Level: ${level}

Include:

- background
- scenario
- relevant data
- problem
- analysis questions
- discussion questions
- model teaching points
`,
        'case-study',
        { subject, topic, level }
      )
    );
  } catch (e) {
    res.status(502).json({ error: e.message });
  }
});

/* =====================================================
   LEARNING OBJECTIVES
===================================================== */

router.post('/learning-objectives', async (req, res) => {
  const {
    subject = '',
    topic = '',
    level = 'University'
  } = req.body || {};

  try {
    res.json(
      await generate(
        `
Create measurable learning objectives.

Subject: ${subject}
Topic: ${topic}
Level: ${level}

Use clear action verbs.
Provide beginner, intermediate and advanced objectives.
`,
        'learning-objectives',
        { subject, topic, level }
      )
    );
  } catch (e) {
    res.status(502).json({ error: e.message });
  }
});

/* =====================================================
   CITATION ASSISTANCE
===================================================== */

router.post('/citation-assistance', async (req, res) => {
  const {
    text = '',
    style = 'APA 7'
  } = req.body || {};

  if (!text) {
    return res.status(400).json({
      error: 'text is required'
    });
  }

  try {
    res.json(
      await generate(
        `
Help prepare citation guidance for the following material.

Citation style: ${style}

Material:

${text}

Do not invent publication details.
Clearly identify information that still needs to be verified.
Provide formatting guidance and placeholders where necessary.
`,
        'citation-assistance',
        { style }
      )
    );
  } catch (e) {
    res.status(502).json({ error: e.message });
  }
});

/* =====================================================
   CLASS MANAGEMENT
===================================================== */

router.get('/classes', (req, res) => {
  res.json({
    ok: true,
    classes: memoryStore.classes
  });
});

router.post('/classes', (req, res) => {
  const {
    name,
    subject = '',
    level = '',
    teacher = '',
    schedule = ''
  } = req.body || {};

  if (!name) {
    return res.status(400).json({
      error: 'class name is required'
    });
  }

  const item = {
    id: `class_${Date.now()}`,
    name,
    subject,
    level,
    teacher,
    schedule,
    createdAt: new Date().toISOString()
  };

  memoryStore.classes.push(item);

  res.json({
    ok: true,
    class: item
  });
});

router.delete('/classes/:id', (req, res) => {
  memoryStore.classes =
    memoryStore.classes.filter(x => x.id !== req.params.id);

  res.json({
    ok: true
  });
});

/* =====================================================
   STUDENT MANAGEMENT
===================================================== */

router.get('/students', (req, res) => {
  const classId = req.query.classId;

  const students = classId
    ? memoryStore.students.filter(x => x.classId === classId)
    : memoryStore.students;

  res.json({
    ok: true,
    students
  });
});

router.post('/students', (req, res) => {
  const {
    name,
    email = '',
    classId = '',
    studentId = ''
  } = req.body || {};

  if (!name) {
    return res.status(400).json({
      error: 'student name is required'
    });
  }

  const item = {
    id: `student_${Date.now()}_${Math.random()
      .toString(36)
      .slice(2, 7)}`,
    studentId,
    name,
    email,
    classId,
    createdAt: new Date().toISOString()
  };

  memoryStore.students.push(item);

  res.json({
    ok: true,
    student: item
  });
});

router.delete('/students/:id', (req, res) => {
  memoryStore.students =
    memoryStore.students.filter(x => x.id !== req.params.id);

  res.json({
    ok: true
  });
});

/* =====================================================
   ATTENDANCE
===================================================== */

router.get('/attendance', (req, res) => {
  const classId = req.query.classId;
  const date = req.query.date;

  let records = memoryStore.attendance;

  if (classId) {
    records = records.filter(x => x.classId === classId);
  }

  if (date) {
    records = records.filter(x => x.date === date);
  }

  res.json({
    ok: true,
    attendance: records
  });
});

router.post('/attendance', (req, res) => {
  const {
    classId,
    studentId,
    date = new Date().toISOString().slice(0, 10),
    status = 'present',
    note = ''
  } = req.body || {};

  if (!classId || !studentId) {
    return res.status(400).json({
      error: 'classId and studentId are required'
    });
  }

  const item = {
    id: `attendance_${Date.now()}_${Math.random()
      .toString(36)
      .slice(2, 7)}`,
    classId,
    studentId,
    date,
    status,
    note,
    createdAt: new Date().toISOString()
  };

  memoryStore.attendance.push(item);

  res.json({
    ok: true,
    attendance: item
  });
});

/* =====================================================
   STUDENT PROGRESS
===================================================== */

router.get('/progress', (req, res) => {
  const studentId = req.query.studentId;

  const records = studentId
    ? memoryStore.progress.filter(x => x.studentId === studentId)
    : memoryStore.progress;

  res.json({
    ok: true,
    progress: records
  });
});

router.post('/progress', (req, res) => {
  const {
    studentId,
    subject = '',
    assessment = '',
    score = 0,
    total = 100,
    comment = ''
  } = req.body || {};

  if (!studentId) {
    return res.status(400).json({
      error: 'studentId is required'
    });
  }

  const percentage =
    total > 0 ? Number(score) / Number(total) * 100 : 0;

  const item = {
    id: `progress_${Date.now()}_${Math.random()
      .toString(36)
      .slice(2, 7)}`,
    studentId,
    subject,
    assessment,
    score: Number(score),
    total: Number(total),
    percentage: Number(percentage.toFixed(2)),
    comment,
    createdAt: new Date().toISOString()
  };

  memoryStore.progress.push(item);

  res.json({
    ok: true,
    progress: item
  });
});

/* =====================================================
   STUDENT PROGRESS SUMMARY
===================================================== */

router.get('/progress/:studentId/summary', (req, res) => {
  const records =
    memoryStore.progress.filter(
      x => x.studentId === req.params.studentId
    );

  if (!records.length) {
    return res.json({
      ok: true,
      count: 0,
      average: 0,
      highest: 0,
      lowest: 0
    });
  }

  const percentages = records.map(x => x.percentage);

  const average =
    percentages.reduce((a, b) => a + b, 0) /
    percentages.length;

  res.json({
    ok: true,
    count: records.length,
    average: Number(average.toFixed(2)),
    highest: Math.max(...percentages),
    lowest: Math.min(...percentages)
  });
});

/* =====================================================
   SAVED TEACHING MATERIALS
===================================================== */

router.get('/materials', (req, res) => {
  res.json({
    ok: true,
    materials: memoryStore.materials
  });
});

router.post('/materials', (req, res) => {
  const {
    title,
    type = 'lesson-notes',
    subject = '',
    content = ''
  } = req.body || {};

  if (!title || !content) {
    return res.status(400).json({
      error: 'title and content are required'
    });
  }

  const item = {
    id: `material_${Date.now()}_${Math.random()
      .toString(36)
      .slice(2, 7)}`,
    title,
    type,
    subject,
    content,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  memoryStore.materials.unshift(item);

  res.json({
    ok: true,
    material: item
  });
});

router.get('/materials/:id', (req, res) => {
  const material =
    memoryStore.materials.find(
      x => x.id === req.params.id
    );

  if (!material) {
    return res.status(404).json({
      error: 'material not found'
    });
  }

  res.json({
    ok: true,
    material
  });
});

router.delete('/materials/:id', (req, res) => {
  memoryStore.materials =
    memoryStore.materials.filter(
      x => x.id !== req.params.id
    );

  res.json({
    ok: true
  });
});

/* =====================================================
   PDF EXPORT
===================================================== */

router.post('/export/pdf', async (req, res) => {
  if (!PDFDocument) {
    return res.status(503).json({
      error: 'PDF engine unavailable'
    });
  }

  const {
    title = 'VECTOR Education Material',
    content = ''
  } = req.body || {};

  if (!content) {
    return res.status(400).json({
      error: 'content is required'
    });
  }

  const filename =
    `vector-${Date.now()}.pdf`;

  const filepath =
    path.join(DATA_DIR, filename);

  try {
    const pdf = new PDFDocument({
      margin: 50
    });

    const stream =
      fs.createWriteStream(filepath);

    pdf.pipe(stream);

    pdf.fontSize(20)
      .text(title);

    pdf.moveDown();

    pdf.fontSize(11)
      .text(content, {
        lineGap: 5
      });

    pdf.end();

    stream.on('finish', () => {
      res.json({
        ok: true,
        format: 'pdf',
        filename,
        download: `/exports/${filename}`
      });
    });
  } catch (e) {
    res.status(500).json({
      error: e.message
    });
  }
});

/* =====================================================
   WORD EXPORT
===================================================== */

router.post('/export/word', async (req, res) => {
  if (!docx) {
    return res.status(503).json({
      error: 'Word engine unavailable'
    });
  }

  const {
    title = 'VECTOR Education Material',
    content = ''
  } = req.body || {};

  if (!content) {
    return res.status(400).json({
      error: 'content is required'
    });
  }

  try {
    const filename =
      `vector-${Date.now()}.docx`;

    const filepath =
      path.join(DATA_DIR, filename);

    const {
      Document,
      Packer,
      Paragraph,
      TextRun
    } = docx;

    const paragraphs =
      String(content)
        .split(/\n+/)
        .map(line =>
          new Paragraph({
            children: [
              new TextRun({
                text: line
              })
            ],
            spacing: {
              after: 120
            }
          })
        );

    const document =
      new Document({
        sections: [
          {
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: title,
                    bold: true,
                    size: 30
                  })
                ]
              }),
              ...paragraphs
            ]
          }
        ]
      });

    const buffer =
      await Packer.toBuffer(document);

    fs.writeFileSync(filepath, buffer);

    res.json({
      ok: true,
      format: 'word',
      filename,
      download: `/exports/${filename}`
    });
  } catch (e) {
    res.status(500).json({
      error: e.message
    });
  }
});

/* =====================================================
   POWERPOINT EXPORT
===================================================== */

router.post('/export/powerpoint', async (req, res) => {
  if (!pptxgen) {
    return res.status(503).json({
      error: 'PowerPoint engine unavailable'
    });
  }

  const {
    title = 'VECTOR Education Presentation',
    slides = []
  } = req.body || {};

  if (!Array.isArray(slides) || !slides.length) {
    return res.status(400).json({
      error: 'slides array is required'
    });
  }

  try {
    const filename =
      `vector-${Date.now()}.pptx`;

    const filepath =
      path.join(DATA_DIR, filename);

    const pptx =
      new pptxgen();

    pptx.layout = 'LAYOUT_WIDE';

    pptx.author =
      "VECTOR by Vector's Element Tech";

    pptx.subject =
      title;

    pptx.title =
      title;

    pptx.company =
      "Vector's Element Tech";

    for (const item of slides) {
      const slide =
        pptx.addSlide();

      slide.background = {
        color: '07101F'
      };

      slide.addText(
        String(item.title || 'VECTOR'),
        {
          x: 0.6,
          y: 0.45,
          w: 12,
          h: 0.7,
          fontSize: 26,
          bold: true,
          color: '36D9FF'
        }
      );

      const bullets =
        Array.isArray(item.bullets)
          ? item.bullets
          : [String(item.content || '')];

      slide.addText(
        bullets
          .map(x => `• ${x}`)
          .join('\n'),
        {
          x: 0.8,
          y: 1.45,
          w: 11.3,
          h: 4.8,
          fontSize: 18,
          color: 'EAF2FF',
          breakLine: false,
          valign: 'top',
          margin: 0.08,
          fit: 'shrink'
        }
      );

      if (item.notes) {
        slide.addNotes(
          String(item.notes)
        );
      }
    }

    await pptx.writeFile({
      fileName: filepath
    });

    res.json({
      ok: true,
      format: 'powerpoint',
      filename,
      download: `/exports/${filename}`
    });
  } catch (e) {
    res.status(500).json({
      error: e.message
    });
  }
});

/* =====================================================
   EXPORT RAW MATERIAL
===================================================== */

router.post('/export/material', async (req, res) => {
  const {
    title = 'VECTOR Teaching Material',
    content = ''
  } = req.body || {};

  if (!content) {
    return res.status(400).json({
      error: 'content is required'
    });
  }

  const filename =
    `vector-material-${Date.now()}.txt`;

  const filepath =
    path.join(DATA_DIR, filename);

  fs.writeFileSync(
    filepath,
    `${title}\n\n${content}`,
    'utf8'
  );

  res.json({
    ok: true,
    format: 'text',
    filename,
    download: `/exports/${filename}`
  });
});

module.exports = router;
