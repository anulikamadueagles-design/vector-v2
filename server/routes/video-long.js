const express = require('express');

const router = express.Router();

const MAX_LONG_SECONDS = 600;
const MAX_SEGMENT_SECONDS = 10;

router.post('/plan', async (req, res) => {
  try {
    const duration = Math.max(
      2,
      Math.min(MAX_LONG_SECONDS, Math.round(Number(req.body.duration || 600)))
    );

    const segments = [];
    let remaining = duration;
    let index = 1;

    while (remaining > 0) {
      const seconds = Math.min(MAX_SEGMENT_SECONDS, remaining);

      segments.push({
        index,
        duration: seconds,
        prompt: req.body.prompt || '',
        aspect_ratio: req.body.aspect_ratio || '9:16',
        resolution: req.body.resolution || 'auto'
      });

      remaining -= seconds;
      index++;
    }

    res.json({
      ok: true,
      mode: 'segmented-long-video',
      requested_duration: duration,
      segment_duration_limit: MAX_SEGMENT_SECONDS,
      segment_count: segments.length,
      segments
    });
  } catch (error) {
    res.status(400).json({
      ok: false,
      error: error.message
    });
  }
});

router.get('/config', (req, res) => {
  res.json({
    ok: true,
    max_duration: MAX_LONG_SECONDS,
    segment_duration: MAX_SEGMENT_SECONDS,
    supported: true
  });
});

module.exports = router;
