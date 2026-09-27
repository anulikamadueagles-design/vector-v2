const DEFAULT_MODEL = process.env.AI_MODEL || 'gpt-4o-mini';

function localFallback(messages = []) {
  const user = messages.filter(x => x.role === 'user').at(-1)?.content || '';
  return {
    content: `VECTOR is online, but no text-AI provider is configured.\n\nYour request:\n${user}\n\nConfigure AI_API_URL, AI_API_KEY and AI_MODEL in the server environment to enable live AI.`
  };
}

exports.callAI = async ({ messages = [], model } = {}) => {
  const url = process.env.AI_API_URL;
  const key = process.env.AI_API_KEY;
  if (!url || !key) return localFallback(messages);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 90000);

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${key}`
      },
      body: JSON.stringify({
        model: model || DEFAULT_MODEL,
        messages
      }),
      signal: controller.signal
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      const detail = data?.error?.message || data?.error || data?.message;
      throw new Error(typeof detail === 'string' ? detail : `AI provider returned HTTP ${response.status}`);
    }

    const content =
      data?.choices?.[0]?.message?.content ??
      data?.output_text ??
      data?.content ??
      data?.message?.content;

    if (typeof content !== 'string' || !content.trim()) {
      throw new Error('AI provider returned an empty or unsupported response.');
    }
    return { content, raw: data };
  } finally {
    clearTimeout(timeout);
  }
};
