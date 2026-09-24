const r = require('express').Router();
const db = require('../lib/local-db');
const { auth } = require('../middleware/auth');

r.get('/', auth(), (q, s) => {
  const items = db.read('memories')
    .filter(x => x.user_id === q.user.id)
    .sort((a, b) =>
      String(b.created_at).localeCompare(String(a.created_at))
    );

  s.json(items);
});

r.post('/', auth(), (q, s) => {
  const items = db.read('memories');

  const item = {
    id: db.id('memory'),
    user_id: q.user.id,
    content: q.body.content,
    source: q.body.source || 'user',
    created_at: new Date().toISOString()
  };

  items.push(item);
  db.write('memories', items);

  s.json(item);
});

r.delete('/:id', auth(), (q, s) => {
  let items = db.read('memories');

  items = items.filter(
    x => !(x.id === q.params.id && x.user_id === q.user.id)
  );

  db.write('memories', items);

  s.json({ ok: true });
});

module.exports = r;
