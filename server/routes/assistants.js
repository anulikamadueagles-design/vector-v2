const r = require('express').Router();
const db = require('../lib/local-db');
const { auth } = require('../middleware/auth');

r.get('/', auth(), (q, s) => {
  const items = db.read('assistants')
    .filter(x => x.user_id === q.user.id);

  s.json(items);
});

r.post('/', auth(), (q, s) => {
  const items = db.read('assistants');

  const item = {
    id: db.id('assistant'),
    user_id: q.user.id,
    name: q.body.name,
    description: q.body.description || '',
    instructions: q.body.instructions || '',
    model: q.body.model || null,
    tools: q.body.tools || [],
    created_at: new Date().toISOString()
  };

  items.push(item);
  db.write('assistants', items);

  s.json(item);
});

module.exports = r;
