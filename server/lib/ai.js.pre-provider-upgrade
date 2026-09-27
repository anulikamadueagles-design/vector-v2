const DEFAULT_MODEL = process.env.AI_MODEL || 'gpt-4o-mini';

function localFallback(messages = []) {
  const user = messages.filter(x => x.role === 'user').at(-1)?.content || '';

  return {
    content:
`VECTOR is running, but no external AI provider is configured yet.

Your request:
${user}

Configure AI_API_URL and AI_API_KEY in .env to enable live AI generation.`
  };
}

exports.callAI = async ({ messages = [], model } = {}) => {
  const url = process.env.AI_API_URL;
  const key = process.env.AI_API_KEY;

  if (!url || !key) {
    return localFallback(messages);
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${key}`
    },
    body: JSON.stringify({
      model: model || DEFAULT_MODEL,
      messages
    })
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data?.error?.message ||
      data?.error ||
      `AI provider returned HTTP ${response.status}`
    );
  }

  return {
    content:
      data?.choices?.[0]?.message?.content ||
      data?.output_text ||
      data?.content ||
      data?.message?.content ||
      JSON.stringify(data),
    raw: data
  };
};
