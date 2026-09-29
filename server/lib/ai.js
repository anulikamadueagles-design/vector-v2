const { GoogleGenAI } = require('@google/genai');

const DEFAULT_MODEL =
  process.env.GEMINI_MODEL || 'gemini-3.5-flash-lite';

function textFromContent(content) {
  if (typeof content === 'string') {
    return content;
  }

  if (Array.isArray(content)) {
    return content
      .map(part => {
        if (typeof part === 'string') return part;
        return part?.text || part?.content || '';
      })
      .filter(Boolean)
      .join('\n');
  }

  if (content == null) {
    return '';
  }

  return String(content);
}

function localFallback(messages = []) {
  const lastUserMessage =
    messages
      .filter(item => item?.role === 'user')
      .at(-1);

  const request =
    textFromContent(lastUserMessage?.content || '');

  return {
    content:
      'VECTOR is online, but Gemini is not configured.\n\n' +
      'Your request:\n' +
      request +
      '\n\n' +
      'Configure GEMINI_API_KEY in the server environment.'
  };
}

function buildInteractionInput(messages = []) {
  const cleaned = [];

  let systemText = '';

  for (const message of messages) {
    const role = message?.role || 'user';

    const text = textFromContent(
      message?.content || ''
    );

    if (!text.trim()) {
      continue;
    }

    if (role === 'system') {
      systemText +=
        (systemText ? '\n\n' : '') + text;
      continue;
    }

    cleaned.push({
      role:
        role === 'assistant'
          ? 'model'
          : 'user',
      parts: [
        {
          text
        }
      ]
    });
  }

  /*
   * Interactions API applies system instructions
   * at the interaction level.
   *
   * The SDK accepts system_instruction separately,
   * so the conversation roles remain intact.
   */
  return {
    input: cleaned,
    system_instruction:
      systemText || undefined
  };
}

exports.callAI = async ({
  messages = [],
  model
} = {}) => {

  const apiKey =
    process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return localFallback(messages);
  }

  const selectedModel =
    model || DEFAULT_MODEL;

  const client =
    new GoogleGenAI({
      apiKey
    });

  const interactionInput =
    buildInteractionInput(messages);

  try {

    const interaction =
      await client.interactions.create({
        model: selectedModel,
        input: interactionInput.input,
        ...(interactionInput.system_instruction
          ? {
              system_instruction:
                interactionInput.system_instruction
            }
          : {}),
        store: false
      });

    const content =
      interaction?.output_text ||
      '';

    if (!content.trim()) {
      throw new Error(
        'Gemini Interactions API returned an empty response.'
      );
    }

    return {
      content,
      raw: interaction
    };

  } catch (error) {

    const message =
      error?.message ||
      'Gemini Interactions API request failed.';

    throw new Error(
      `Gemini AI error: ${message}`
    );
  }
};
