const DEFAULT_MODEL = process.env.GEMINI_MODEL || process.env.AI_MODEL || 'gemini-2.5-flash-lite';

function textFromContent(content) {
  if (typeof content === 'string') return content;

  if (Array.isArray(content)) {
    return content
      .map(part => {
        if (typeof part === 'string') return part;
        return part?.text || part?.content || '';
      })
      .filter(Boolean)
      .join('\n');
  }

  if (content == null) return '';

  return String(content);
}

function localFallback(messages = []) {
  const userMessage = messages
    .filter(item => item?.role === 'user')
    .at(-1);

  const user = textFromContent(userMessage?.content || '');

  return {
    content:
      'VECTOR is online, but no Gemini AI provider key is configured.\n\n' +
      'Your request:\n' +
      user +
      '\n\nAdd GEMINI_API_KEY to the server environment to enable live AI.'
  };
}

function buildGeminiMessages(messages = []) {
  let systemInstruction = '';
  const contents = [];

  for (const message of messages) {
    const role = message?.role || 'user';
    const text = textFromContent(message?.content || '');

    if (!text.trim()) continue;

    if (role === 'system') {
      systemInstruction += (systemInstruction ? '\n\n' : '') + text;
      continue;
    }

    contents.push({
      role: role === 'assistant' ? 'model' : 'user',
      parts: [{ text }]
    });
  }

  return {
    systemInstruction: systemInstruction
      ? { parts: [{ text: systemInstruction }] }
      : undefined,
    contents
  };
}

exports.callAI = async ({ messages = [], model } = {}) => {
  const key = process.env.GEMINI_API_KEY;

  if (!key) {
    return localFallback(messages);
  }

  const selectedModel = model || DEFAULT_MODEL;

  const endpoint =
    'https://generativelanguage.googleapis.com/v1beta/models/' +
    encodeURIComponent(selectedModel) +
    ':generateContent?key=' +
    encodeURIComponent(key);

  const payload = buildGeminiMessages(messages);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 90000);

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload),
      signal: controller.signal
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const detail =
        data?.error?.message ||
        data?.error ||
        data?.message ||
        ('Gemini returned HTTP ' + response.status);

      throw new Error(
        typeof detail === 'string'
          ? detail
          : JSON.stringify(detail)
      );
    }

    const content = (data?.candidates || [])
      .flatMap(candidate => candidate?.content?.parts || [])
      .map(part => part?.text || '')
      .filter(Boolean)
      .join('\n');

    if (!content.trim()) {
      throw new Error('Gemini returned an empty response.');
    }

    return {
      content,
      raw: data
    };
  } finally {
    clearTimeout(timeout);
  }
};
