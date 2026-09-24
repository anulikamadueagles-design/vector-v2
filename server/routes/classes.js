const express = require('express');
const router = express.Router();
const store = require('../lib/education-store');

router.get('/', (req, res) => {
  res.json({ ok: true, classes: store.read('classes') });
});

router.post('/', (req, res) => {
  const { name, subject = '', level = '', teacher = 'VECTOR Teacher', schedule = '' } = req.body || {};

  if (!name) {
    return res.status(400).json({ error: 'class name is required' });
  }

  const classes = store.read('classes');

  const item = {
    id: store.id('class'),
    name,
    subject,
    level,
    teacher,
    schedule,
    createdAt: new Date().toISOString()
  };

  classes.push(item);
  store.write('classes', classes);

  res.json({ ok: true, class: item });
});

router.get('/:id', (req, res) => {
  const item = store.read('classes').find(x => x.id === req.params.id);

  if (!item) {
    return res.status(404).json({ error: 'class not found' });
  }

  res.json({ ok: true, class: item });
});

router.delete('/:id', (req, res) => {
  const classes = store.read('classes');
  const next = classes.filter(x => x.id !== req.params.id);

  store.write('classes', next);

  res.json({ ok: true });
});

module.exports = router;
