const express = require('express');
const router = express.Router();
const store = require('../lib/education-store');

router.get('/', (req, res) => {
  let students = store.read('students');

  if (req.query.classId) {
    students = students.filter(x => x.classId === req.query.classId);
  }

  res.json({ ok: true, students });
});

router.post('/', (req, res) => {
  const {
    studentId = '',
    name,
    email = '',
    classId = '',
    department = '',
    programme = ''
  } = req.body || {};

  if (!name) {
    return res.status(400).json({ error: 'student name is required' });
  }

  const students = store.read('students');

  const student = {
    id: store.id('student'),
    studentId,
    name,
    email,
    classId,
    department,
    programme,
    createdAt: new Date().toISOString()
  };

  students.push(student);
  store.write('students', students);

  res.json({ ok: true, student });
});

router.get('/:id', (req, res) => {
  const student = store.read('students').find(x => x.id === req.params.id);

  if (!student) {
    return res.status(404).json({ error: 'student not found' });
  }

  res.json({ ok: true, student });
});

router.delete('/:id', (req, res) => {
  store.write(
    'students',
    store.read('students').filter(x => x.id !== req.params.id)
  );

  res.json({ ok: true });
});

module.exports = router;
