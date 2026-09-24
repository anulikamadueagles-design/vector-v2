const r = require('express').Router();
const { auth } = require('../middleware/auth');
const db = require('../lib/local-db');

r.get('/overview', auth(), (q, s) => {
  if (
    process.env.ADMIN_EMAIL &&
    q.user.email !== process.env.ADMIN_EMAIL
  ) {
    return s.status(403).json({
      error: 'Admin access required'
    });
  }

  const users = db.read('users');
  const conversations = db.read('conversations');
  const projects = db.read('projects');
  const usageEvents = db.read('usage_events');

  s.json({
    configured: true,
    users: users.length,
    conversations: conversations.length,
    projects: projects.length,
    usageEvents: usageEvents.length
  });
});

module.exports = r;
