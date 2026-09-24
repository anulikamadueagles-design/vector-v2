const express = require('express');
const router = express.Router();
const store = require('../lib/education-store');

router.get('/', (req, res) => {
  let records = store.read('attendance');

  if (req.query.classId) {
    records = records.filter(x => x.classId === req.query.classId);
  }

  if (req.query.studentId) {
    records = records.filter(x => x.studentId === req.query.studentId);
  }

  res.json({ ok: true, attendance: records });
});

router.post('/', (req, res) => {
  const {
    classId = '',
    studentId = '',
    date = new Date().toISOString().slice(0, 10),
    status = 'present',
    note = ''
  } = req.body || {};

  if (!studentId) {
    return res.status(400).json({ error: 'studentId is required' });
  }

  const records = store.read('attendance');

  const record = {
    id: store.id('attendance'),
    classId,
    studentId,
    date,
    status,
    note,
    createdAt: new Date().toISOString()
  };

  records.push(record);
  store.write('attendance', records);

  res.json({ ok: true, attendance: record });
});

router.post('/bulk', (req, res) => {
  const {
    classId = '',
    date = new Date().toISOString().slice(0, 10),
    records: input = []
  } = req.body || {};

  const records = store.read('attendance');

  for (const item of input) {
    records.push({
      id: store.id('attendance'),
      classId,
      studentId: item.studentId,
      date,
      status: item.status || 'present',
      note: item.note || '',
      createdAt: new Date().toISOString()
    });
  }

  store.write('attendance', records);

  res.json({
    ok: true,
    added: input.length
  });
});

module.exports = router;
