const express = require('express');
const router = express.Router();

router.post('/generate', async (req, res) => {
  const prompt = String(req.body?.prompt || '').trim();

  if (!prompt) {
    return res.status(400).json({
      error: 'prompt is required'
    });
  }

  try {
    const enhanced =
      `professional futuristic educational AI visual, VECTOR AI,
       premium dark holographic interface, cinematic lighting,
       clean modern technology aesthetic, high detail,
       ${prompt}`;

    const url =
      'https://image.pollinations.ai/prompt/' +
      encodeURIComponent(enhanced) +
      '?width=1024&height=1024&nologo=true';

    const response = await fetch(url, { method: 'HEAD' });

    if (!response.ok) {
      throw new Error(`Pollinations returned HTTP ${response.status}`);
    }

    res.json({
      ok: true,
      provider: 'Pollinations AI',
      prompt,
      imageUrl: url
    });
  } catch (e) {
    res.status(502).json({
      error: 'Image generation failed',
      details: e.message
    });
  }
});

module.exports = router;
