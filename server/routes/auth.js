const r = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const db = require('../lib/local-db');

const sign = u =>
  jwt.sign(
    { id: u.id, email: u.email },
    process.env.JWT_SECRET,
    { expiresIn: '30d' }
  );

r.post('/register', async (q, s) => {
  try {
    const { email, password, name = '' } = q.body || {};

    if (!email || !password) {
      return s.status(400).json({
        error: 'email and password are required'
      });
    }

    const users = db.read('users');

    if (
      users.some(
        u => u.email.toLowerCase() === email.toLowerCase()
      )
    ) {
      return s.status(409).json({
        error: 'User already exists'
      });
    }

    const user = {
      id: db.id('user'),
      email: email.toLowerCase(),
      name,
      password_hash: await bcrypt.hash(password, 12),
      created_at: new Date().toISOString()
    };

    users.push(user);
    db.write('users', users);

    s.json({
      ok: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      },
      token: sign(user)
    });
  } catch (e) {
    s.status(500).json({ error: e.message });
  }
});

r.post('/login', async (q, s) => {
  try {
    const { email, password } = q.body || {};

    const users = db.read('users');

    const user = users.find(
      u => u.email.toLowerCase() === String(email).toLowerCase()
    );

    if (
      !user ||
      !(await bcrypt.compare(password || '', user.password_hash))
    ) {
      return s.status(401).json({
        error: 'Invalid email or password'
      });
    }

    s.json({
      ok: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      },
      token: sign(user)
    });
  } catch (e) {
    s.status(500).json({ error: e.message });
  }
});

r.get('/me', require('../middleware/auth').auth(), (q, s) => {
  const users = db.read('users');
  const user = users.find(u => u.id === q.user.id);

  if (!user) {
    return s.status(404).json({
      error: 'User not found'
    });
  }

  s.json({
    id: user.id,
    email: user.email,
    name: user.name
  });
});

module.exports = r;
