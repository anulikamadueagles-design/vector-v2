const r = require("express").Router();

r.get("/", async (req, res) => {
  const query = String(req.query.q || "").trim();

  if (!query) {
    return res.status(400).json({
      error: "q is required"
    });
  }

  try {
    const response = await fetch(
      "https://api.duckduckgo.com/?q=" +
      encodeURIComponent(query) +
      "&format=json&no_html=1&skip_disambig=1"
    );

    const data = await response.json();

    const results = [];

    if (data.AbstractText) {
      results.push({
        title: data.Heading || query,
        snippet: data.AbstractText,
        url: data.AbstractURL || "https://duckduckgo.com/"
      });
    }

    for (const item of data.RelatedTopics || []) {
      if (item.Text && item.FirstURL) {
        results.push({
          title: item.Text.slice(0, 100),
          snippet: item.Text,
          url: item.FirstURL
        });
      }

      if (item.Topics) {
        for (const nested of item.Topics) {
          if (nested.Text && nested.FirstURL) {
            results.push({
              title: nested.Text.slice(0, 100),
              snippet: nested.Text,
              url: nested.FirstURL
            });
          }
        }
      }
    }

    res.json({
      ok: true,
      query,
      results: results.slice(0, 12)
    });

  } catch (error) {
    res.status(502).json({
      error: "Web search failed",
      detail: error.message
    });
  }
});

module.exports = r;
