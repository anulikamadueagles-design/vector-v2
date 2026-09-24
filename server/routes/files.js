const r = require("express").Router();
const multer = require("multer");

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 25 * 1024 * 1024
  }
});

r.post("/analyze", upload.single("file"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      error: "file is required"
    });
  }

  const name = req.file.originalname;
  const mime = req.file.mimetype;
  const size = req.file.size;

  const textFile =
    /text|json|javascript|xml|csv|markdown/i.test(mime) ||
    /\.(txt|md|csv|json|js|html|css|xml)$/i.test(name);

  let text = null;

  if (textFile) {
    text = req.file.buffer
      .toString("utf8")
      .slice(0, 150000);
  }

  res.json({
    ok: true,
    filename: name,
    mimeType: mime,
    size,
    textExtracted: Boolean(text),
    text,
    message: text
      ? "File read successfully."
      : "File received. Advanced PDF/DOCX/XLSX extraction can be connected later."
  });
});

module.exports = r;
