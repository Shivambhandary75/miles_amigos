const express = require('express');
const router = express.Router();
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

// Proxy for Nominatim geocoding/search
router.get('/search', async (req, res) => {
  const { q, format = 'json', limit = 5, addressdetails = 1, countrycodes, language } = req.query;
  if (!q || q.trim().length < 2) {
    return res.status(400).json({ error: 'Query too short' });
  }
  const params = new URLSearchParams({
    q,
    format,
    limit: String(limit),
    addressdetails: String(addressdetails)
  });
  if (countrycodes) params.set('countrycodes', countrycodes);
  if (language) params.set('accept-language', language);
  const url = `https://nominatim.openstreetmap.org/search?${params.toString()}`;
  try {
    const response = await fetch(url);
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch from Nominatim', details: err.message });
  }
});

// Proxy for Nominatim reverse geocoding
router.get('/reverse', async (req, res) => {
  const { lat, lon, format = 'json' } = req.query;
  if (!lat || !lon) {
    return res.status(400).json({ error: 'lat and lon required' });
  }
  const params = new URLSearchParams({ lat, lon, format });
  const url = `https://nominatim.openstreetmap.org/reverse?${params.toString()}`;
  try {
    const response = await fetch(url);
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch from Nominatim', details: err.message });
  }
});

module.exports = router;