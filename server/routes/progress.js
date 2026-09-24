const express = require('express');
const router = express.Router();
const store = require('../lib/education-store');

router.get('/', (req, res) => {
  let records = store.read('progress');

  if (req.query.studentId) {
    records = records.filter(x => x.studentId === req.query.studentId);
  }

  if (req.query.classId) {
    records = records.filter(x => x.classId === req.query.classId);
  }

  res.json({ ok: true, progress: records });
});

router.post('/', (req, res) => {
  const {
    studentId,
    classId = '',
    subject = '',
    assessment = '',
    score = 0,
    total = 100,
    teacherNote = ''
  } = req.body || {};

  if (!studentId) {
    return res.status(400).json({ error: 'studentId is required' });
  }

  const numericScore = Number(score);
  const numericTotal = Number(total) || 100;

  const record = {
    id: store.id('progress'),
    studentId,
    classId,
    subject,
    assessment,
    score: numericScore,
    total: numericTotal,
    percentage: Number(((numericScore / numericTotal) * 100).toFixed(2)),
    teacherNote,
    createdAt: new Date().toISOString()
  };

  const progress = store.read('progress');
  progress.push(record);
  store.write('progress', progress);

  res.json({ ok: true, progress: record });
});

router.get('/student/:studentId/summary', (req, res) => {
  const records = store
    .read('progress')
    .filter(x => x.studentId === req.params.studentId);

  const average = records.length
    ? Number(
        (
          records.reduce((sum, x) => sum + Number(x.percentage || 0), 0) /
          records.length
        ).toFixed(2)
      )
    : 0;

  res.json({
    ok: true,
    studentId: req.params.studentId,
    assessments: records.length,
    average,
    records
  });
});

module.exports = router;
