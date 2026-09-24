const r = require('express').Router();
const db = require('../lib/local-db');
const { auth } = require('../middleware/auth');

r.get('/', auth(), (q, s) => {
  const items = db.read('projects')
    .filter(x => x.user_id === q.user.id)
    .sort((a, b) =>
      String(b.updated_at).localeCompare(String(a.updated_at))
    );

  s.json(items);
});

r.post('/', auth(), (q, s) => {
  const items = db.read('projects');
  const now = new Date().toISOString();

  const item = {
    id: db.id('project'),
    user_id: q.user.id,
    name: q.body.name,
    description: q.body.description || '',
    instructions: q.body.instructions || '',
    created_at: now,
    updated_at: now
  };

  items.push(item);
  db.write('projects', items);

  s.json(item);
});

r.delete('/:id', auth(), (q, s) => {
  let items = db.read('projects');

  items = items.filter(
    x => !(x.id === q.params.id && x.user_id === q.user.id)
  );

  db.write('projects', items);

  s.json({ ok: true });
});

module.exports = r;
