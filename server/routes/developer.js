const r = require('express').Router();
const crypto = require('crypto');
const { auth } = require('../middleware/auth');
const db = require('../lib/local-db');

r.post('/keys', auth(), (q, s) => {
  const items = db.read('api_keys');
  const key = 'vctr_' + crypto.randomBytes(24).toString('hex');

  const item = {
    id: db.id('key'),
    user_id: q.user.id,
    name: q.body.name || 'Default key',
    key_hash: crypto.createHash('sha256').update(key).digest('hex'),
    key_prefix: key.slice(0, 12),
    created_at: new Date().toISOString(),
    revoked_at: null
  };

  items.push(item);
  db.write('api_keys', items);

  s.json({
    id: item.id,
    name: item.name,
    key_prefix: item.key_prefix,
    created_at: item.created_at,
    key
  });
});

r.get('/keys', auth(), (q, s) => {
  const items = db.read('api_keys')
    .filter(x => x.user_id === q.user.id)
    .map(x => ({
      id: x.id,
      name: x.name,
      key_prefix: x.key_prefix,
      created_at: x.created_at,
      revoked_at: x.revoked_at
    }));

  s.json(items);
});

module.exports = r;
