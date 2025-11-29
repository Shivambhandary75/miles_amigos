const express = require('express');
const router = express.Router();
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

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


// Proxy for GraphHopper routing (adapting to OSRM format)
router.get('/route', async (req, res) => {
  const { start, end } = req.query;
  if (!start || !end) {
    return res.status(400).json({ error: 'start and end coordinates required' });
  }

  const apiKey = process.env.GRAPHHOPPER_API_KEY;
  if (!apiKey) {
    console.error('GraphHopper API key missing');
    return res.status(500).json({ error: 'Server configuration error: API key missing' });
  }

  // GraphHopper expects "point=lat,lon&point=lat,lon"
  // Input comes as "lon,lat" strings
  const [startLon, startLat] = start.split(',');
  const [endLon, endLat] = end.split(',');

  const query = new URLSearchParams({
    key: apiKey,
    profile: 'car',
    locale: 'en',
    calc_points: 'true',
    points_encoded: 'false'
  });
  query.append('point', `${startLat},${startLon}`);
  query.append('point', `${endLat},${endLon}`);

  const url = `https://graphhopper.com/api/1/route?${query.toString()}`;

  console.log(`[GraphHopper Proxy] Fetching route...`);

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout

    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('GraphHopper Error:', response.status, errorText);
      throw new Error(`GraphHopper responded with ${response.status}`);
    }

    const ghData = await response.json();

    // Transform GraphHopper response to OSRM format
    // OSRM: { routes: [{ distance: meters, duration: seconds, geometry: { coordinates: [[lon,lat],...] } }] }
    // GraphHopper: { paths: [{ distance: meters, time: ms, points: { coordinates: [[lon,lat],...] } }] }

    if (ghData.paths && ghData.paths.length > 0) {
      const path = ghData.paths[0];
      const osrmResponse = {
        code: 'Ok',
        routes: [{
          distance: path.distance,
          duration: path.time / 1000, // Convert ms to seconds
          geometry: path.points // GeoJSON { type: "LineString", coordinates: [...] }
        }]
      };
      res.json(osrmResponse);
    } else {
      res.json({ code: 'NoRoute', routes: [] });
    }

  } catch (err) {
    console.error('GraphHopper Proxy Error:', err);
    res.status(500).json({ error: 'Failed to fetch route', details: err.message });
  }
});

module.exports = router;