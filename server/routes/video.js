const express = require('express');

// VECTOR_VIDEO_COMPATIBILITY_PATCH
const VIDEO_RESOLUTIONS = ['720p', '1080p'];
const VIDEO_RATIOS = ['9:16', '16:9', '1:1'];
const VIDEO_DURATIONS = [2, 3, 4, 5, 6, 7, 8, 9, 10];

function normalizeVideoOptions(body = {}) {
  let duration = Number(body.duration || 5);
  if (!Number.isFinite(duration)) duration = 5;

  duration = Math.max(2, Math.min(10, Math.round(duration)));

  let aspectRatio = String(body.aspect_ratio || '16:9');
  if (!VIDEO_RATIOS.includes(aspectRatio)) aspectRatio = '16:9';

  let resolution = String(body.resolution || 'auto').toLowerCase();

  if (resolution !== 'auto' && VIDEO_RESOLUTIONS.includes(resolution) === false) {
    resolution = 'auto';
  }

  return {
    prompt: String(body.prompt || '').trim(),
    duration,
    aspect_ratio: aspectRatio,
    resolution
  };
}

function isCompatibilityError(status, data) {
  const text = JSON.stringify(data || {}).toLowerCase();

  return (
    status === 400 ||
    status === 422 ||
    text.includes('resolution') ||
    text.includes('not available') ||
    text.includes('unsupported') ||
    text.includes('invalid combination') ||
    text.includes('aspect ratio') ||
    text.includes('not support')
  );
}

async function providerFetchWithFallback({
  url,
  headers,
  body,
  fallbackBody
}) {
  let response = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(body)
  });

  let data = await response.json().catch(() => ({}));

  if (!response.ok && fallbackBody && isCompatibilityError(response.status, data)) {
    response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(fallbackBody)
    });

    data = await response.json().catch(() => ({}));
  }

  return { response, data };
}



/* VECTOR_REAL_PROVIDER_FALLBACK */

async function vectorProviderRequest(url, options = {}) {

  let response = await vectorProviderRequest(url, options);

  if (response.ok) {
    return response;
  }

  let data = {};

  try {
    data = await response.clone().json();
  } catch {}

  const errorText = JSON.stringify(data).toLowerCase();

  const compatibilityProblem =
    response.status === 400 ||
    response.status === 422 ||
    errorText.includes('resolution') ||
    errorText.includes('unsupported') ||
    errorText.includes('not available') ||
    errorText.includes('invalid combination') ||
    errorText.includes('aspect ratio') ||
    errorText.includes('does not support');

  if (compatibilityProblem && options.body) {

    try {

      const body = JSON.parse(options.body);

      delete body.resolution;
      delete body.output_resolution;
      delete body.video_resolution;

      response = await fetch(url, {
        ...options,
        body: JSON.stringify(body)
      });

      if (response.ok) {
        return response;
      }

      body.duration = Math.min(
        Number(body.duration) || 5,
        5
      );

      response = await fetch(url, {
        ...options,
        body: JSON.stringify(body)
      });

    } catch {}

  }

  return response;
}

const router = express.Router();

const MAGIC_BASE =
  process.env.MAGIC_HOUR_BASE_URL || 'https://api.magichour.ai';

const PIXAZO_BASE =
  process.env.PIXAZO_BASE_URL || 'https://api.pixazo.ai';

function requireKey(value, name) {
  if (!value) {
    throw new Error(`${name} API key is not configured on the server.`);
  }
}

async function json(url, options = {}) {
  const response = await vectorProviderRequest(url, options);

  const text = await response.text();

  let data = {};

  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { raw: text };
  }

  if (!response.ok) {
    throw new Error(
      data?.error?.message ||
      data?.error ||
      data?.message ||
      `Provider returned HTTP ${response.status}`
    );
  }

  return data;
}

/*
 * MAGIC HOUR
 */

async function magicGenerate({
  prompt,
  duration,
  aspectRatio,
  resolution
}) {
  requireKey(
    process.env.MAGIC_HOUR_API_KEY,
    'Magic Hour'
  );

  return json(`${MAGIC_BASE}/v1/text-to-video`, {
    method: 'POST',
    headers: {
      accept: 'application/json',
      authorization:
        `Bearer ${process.env.MAGIC_HOUR_API_KEY}`,
      'content-type': 'application/json'
    },
    body: JSON.stringify({
      name: `VECTOR Video ${Date.now()}`,
      end_seconds: Number(duration),
      aspect_ratio: aspectRatio,
      resolution,
      style: {
        prompt
      },
      audio: true
    })
  });
}

async function magicStatus(id) {
  requireKey(
    process.env.MAGIC_HOUR_API_KEY,
    'Magic Hour'
  );

  return json(
    `${MAGIC_BASE}/v1/video-projects/${encodeURIComponent(id)}`,
    {
      headers: {
        accept: 'application/json',
        authorization:
          `Bearer ${process.env.MAGIC_HOUR_API_KEY}`
      }
    }
  );
}

/*
 * PIXAZO
 */

async function pixazoGenerate({
  prompt,
  duration,
  aspectRatio,
  resolution,
  style
}) {
  requireKey(
    process.env.PIXAZO_API_KEY,
    'Pixazo'
  );

  return json(`${PIXAZO_BASE}/v1/text-to-video`, {
    method: 'POST',
    headers: {
      accept: 'application/json',
      authorization:
        `Bearer ${process.env.PIXAZO_API_KEY}`,
      'content-type': 'application/json'
    },
    body: JSON.stringify({
      prompt,
      duration: Number(duration),
      aspect_ratio: aspectRatio,
      resolution,
      style: style || 'photorealistic'
    })
  });
}

async function pixazoStatus(id) {
  requireKey(
    process.env.PIXAZO_API_KEY,
    'Pixazo'
  );

  return json(
    `${PIXAZO_BASE}/v1/jobs/${encodeURIComponent(id)}`,
    {
      headers: {
        accept: 'application/json',
        authorization:
          `Bearer ${process.env.PIXAZO_API_KEY}`
      }
    }
  );
}

function normalize(provider, data) {
  if (provider === 'pixazo') {
    return {
      provider,
      id:
        data.job_id ||
        data.request_id ||
        data.id,
      status:
        data.status ||
        'processing',
      pollUrl:
        data.poll_url ||
        null
    };
  }

  return {
    provider,
    id:
      data.id ||
      data.project_id,
    status:
      data.status ||
      'queued'
  };
}

function normalizeStatus(provider, data) {
  if (provider === 'pixazo') {
    return {
      provider,
      id:
        data.job_id ||
        data.request_id ||
        data.id,
      status:
        String(data.status || '').toUpperCase(),
      outputUrl:
        data.output_url ||
        data.video_url ||
        data.output?.url ||
        data.output?.video_url ||
        null,
      error:
        data.error?.message ||
        data.error ||
        data.message ||
        null
    };
  }

  const downloads =
    Array.isArray(data.downloads)
      ? data.downloads
      : [];

  return {
    provider,
    id:
      data.id ||
      data.project_id,
    status:
      String(data.status || '').toUpperCase(),
    outputUrl:
      downloads[0]?.url ||
      data.output_url ||
      data.video_url ||
      data.video?.url ||
      null,
    error:
      data.error?.message ||
      data.error ||
      data.error_message ||
      null
  };
}

/*
 * PROVIDER STATUS
 */

router.get('/config', (req, res) => {
  res.json({
    ok: true,
    providers: {
      magichour:
        Boolean(process.env.MAGIC_HOUR_API_KEY),
      pixazo:
        Boolean(process.env.PIXAZO_API_KEY)
    }
  });
});

router.post('/generate', async (req, res) => {
  try {
    const {
      provider = 'magichour',
      prompt,
      duration = 5,
      aspectRatio = '9:16',
      resolution = 'auto',
      style = 'photorealistic'
    } = req.body || {};

    if (!prompt || String(prompt).trim().length < 8) {
      return res.status(400).json({
        ok: false,
        error: 'Please provide a detailed video prompt.'
      });
    }

    if (!['magichour', 'pixazo'].includes(provider)) {
      return res.status(400).json({
        ok: false,
        error: 'Unsupported video provider.'
      });
    }

    const seconds = Math.max(
      2,
      Math.min(Number(duration) || 5, 10)
    );

    const ratio =
      ['9:16', '16:9', '1:1'].includes(aspectRatio)
        ? aspectRatio
        : '9:16';

    const size =
      ['720p', '1080p'].includes(resolution)
        ? resolution
        : '720p';

    let raw;

    if (provider === 'magichour') {
      raw = await magicGenerate({
        prompt: String(prompt).trim(),
        duration: seconds,
        aspectRatio: ratio,
        ...(size && size !== 'auto' ? { resolution: size } : {})
      });
    } else {
      raw = await pixazoGenerate({
        prompt: String(prompt).trim(),
        duration: seconds,
        aspectRatio: ratio,
        ...(size && size !== 'auto' ? { ...(size && size !== 'auto' ? { resolution: size } : {}) } : {}),
        style
      });
    }

    res.status(202).json({
      ok: true,
      job: normalize(provider, raw)
    });

  } catch (error) {
    console.error('VIDEO GENERATION ERROR:', error);

    res.status(502).json({
      ok: false,
      error: error.message
    });
  }
});

router.get('/status/:provider/:id', async (req, res) => {
  try {
    const {
      provider,
      id
    } = req.params;

    if (
      !['magichour', 'pixazo'].includes(provider)
    ) {
      return res.status(400).json({
        ok: false,
        error: 'Unsupported video provider.'
      });
    }

    const raw =
      provider === 'magichour'
        ? await magicStatus(id)
        : await pixazoStatus(id);

    res.json({
      ok: true,
      job: normalizeStatus(provider, raw)
    });

  } catch (error) {
    res.status(502).json({
      ok: false,
      error: error.message
    });
  }
});

module.exports = router;
