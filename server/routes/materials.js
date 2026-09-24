const express = require('express');
const router = express.Router();
const store = require('../lib/education-store');

router.get('/', (req, res) => {
  let materials = store.read('materials');

  if (req.query.type) {
    materials = materials.filter(x => x.type === req.query.type);
  }

  if (req.query.subject) {
    materials = materials.filter(x => x.subject === req.query.subject);
  }

  res.json({ ok: true, materials });
});

router.post('/', (req, res) => {
  const {
    title,
    type = 'lesson-notes',
    subject = '',
    topic = '',
    level = '',
    content = ''
  } = req.body || {};

  if (!title || !content) {
    return res.status(400).json({
      error: 'title and content are required'
    });
  }

  const material = {
    id: store.id('material'),
    title,
    type,
    subject,
    topic,
    level,
    content,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const materials = store.read('materials');
  materials.push(material);
  store.write('materials', materials);

  res.json({ ok: true, material });
});

router.get('/:id', (req, res) => {
  const material = store
    .read('materials')
    .find(x => x.id === req.params.id);

  if (!material) {
    return res.status(404).json({ error: 'material not found' });
  }

  res.json({ ok: true, material });
});

router.delete('/:id', (req, res) => {
  store.write(
    'materials',
    store.read('materials').filter(x => x.id !== req.params.id)
  );

  res.json({ ok: true });
});

module.exports = router;
