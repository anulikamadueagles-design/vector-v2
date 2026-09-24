const r = require('express').Router();
const db = require('../lib/local-db');
const { auth } = require('../middleware/auth');
const { callAI } = require('../lib/ai');

r.post('/', auth(), async (q, s) => {
  try {
    const {
      conversationId,
      message,
      model,
      system = 'You are VECTOR, a helpful accurate AI assistant.'
    } = q.body || {};

    if (!message) {
      return s.status(400).json({
        error: 'message is required'
      });
    }

    const users = db.read('users');

    if (!users.some(x => x.id === q.user.id)) {
      return s.status(401).json({
        error: 'User not found'
      });
    }

    let conversations = db.read('conversations');
    let messages = db.read('messages');

    let id = conversationId;
    let history = [];

    if (!id) {
      const now = new Date().toISOString();

      const conversation = {
        id: db.id('conversation'),
        user_id: q.user.id,
        title: message.slice(0, 60),
        model: model || null,
        created_at: now,
        updated_at: now
      };

      conversations.push(conversation);
      db.write('conversations', conversations);
      id = conversation.id;
    }

    const conversation = conversations.find(
      x => x.id === id && x.user_id === q.user.id
    );

    if (!conversation) {
      return s.status(404).json({
        error: 'Conversation not found'
      });
    }

    history = messages
      .filter(
        x =>
          x.conversation_id === id &&
          x.user_id === q.user.id
      )
      .sort((a, b) =>
        String(a.created_at).localeCompare(String(b.created_at))
      )
      .slice(-50)
      .map(x => ({
        role: x.role,
        content: x.content
      }));

    const now = new Date().toISOString();

    messages.push({
      id: db.id('message'),
      conversation_id: id,
      user_id: q.user.id,
      role: 'user',
      content: message,
      created_at: now
    });

    db.write('messages', messages);

    const a = await callAI({
      messages: [
        { role: 'system', content: system },
        ...history,
        { role: 'user', content: message }
      ],
      model
    });

    messages = db.read('messages');

    messages.push({
      id: db.id('message'),
      conversation_id: id,
      user_id: q.user.id,
      role: 'assistant',
      content: a.content,
      created_at: new Date().toISOString()
    });

    db.write('messages', messages);

    conversations = db.read('conversations');

    const index = conversations.findIndex(
      x => x.id === id && x.user_id === q.user.id
    );

    if (index !== -1) {
      conversations[index].updated_at =
        new Date().toISOString();
      db.write('conversations', conversations);
    }

    const usage = db.read('usage_events');

    usage.push({
      id: db.id('usage'),
      user_id: q.user.id,
      event_type: 'chat',
      units: 1,
      created_at: new Date().toISOString()
    });

    db.write('usage_events', usage);

    s.json({
      conversationId: id,
      ...a
    });

  } catch (e) {
    s.status(502).json({
      error: e.message
    });
  }
});

r.get('/conversations', auth(), (q, s) => {
  const items = db.read('conversations')
    .filter(x => x.user_id === q.user.id)
    .sort((a, b) =>
      String(b.updated_at).localeCompare(String(a.updated_at))
    );

  s.json(items);
});

module.exports = r;
