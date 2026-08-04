import express from 'express';
import * as searchController from '../controllers/search-controller.js';
import config from '../config/index.js';

const router = express.Router();

// Web search endpoint
router.get('/search', searchController.searchWeb);

// Image search endpoint  
router.get('/images', searchController.searchImages);

// News search endpoint (with positive filtering)
router.get('/news', searchController.searchNews);

// Cache management endpoints
router.get('/cache/stats', searchController.getCacheStats);
router.delete('/cache', searchController.clearCache);

// [SovereignBrowser] Omnibox autosuggest, backed by the Autosuggest plan key.
// Deliberately NOT cached: that plan is marked "Rights to store data: no",
// so responses must not be persisted anywhere.
router.get('/suggest', async (req, res) => {
  const q = (req.query.q || '').toString().trim();
  if (!q) {
    return res.json({ results: [] });
  }
  if (q.length > 200) {
    return res.status(400).json({ error: 'Query too long' });
  }

  const key = config.braveKeys && config.braveKeys.autosuggest;
  if (!key) {
    return res.status(503).json({ error: 'Autosuggest key not configured' });
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 3000);

  try {
    const url = `https://api.search.brave.com/res/v1/suggest/search?q=${encodeURIComponent(q)}&count=6`;
    const upstream = await fetch(url, {
      headers: { Accept: 'application/json', 'X-Subscription-Token': key },
      signal: controller.signal
    });

    if (!upstream.ok) {
      console.warn(`[suggest] Brave returned ${upstream.status} for "${q}"`);
      return res.status(upstream.status).json({ error: `Brave suggest returned ${upstream.status}` });
    }

    const data = await upstream.json();
    const results = Array.isArray(data.results)
      ? data.results.map((item) => (typeof item === 'string' ? item : item.query)).filter(Boolean)
      : [];

    res.set('Cache-Control', 'no-store');
    return res.json({ results });
  } catch (err) {
    if (err.name === 'AbortError') {
      console.warn(`[suggest] timed out for "${q}"`);
      return res.status(504).json({ error: 'Brave suggest timed out' });
    }
    console.error('[suggest] upstream failure:', err.message);
    return res.status(502).json({ error: 'Suggest upstream failure' });
  } finally {
    clearTimeout(timer);
  }
});

export default router;
