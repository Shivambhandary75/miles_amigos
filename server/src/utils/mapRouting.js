/**
 * Backend Routing & Geocoding Service
 * Use this in your Node.js/Express backend
 */

const fetch = require("node-fetch"); // npm install node-fetch@2

// ============================================
// OSRM Configuration
// ============================================

const OSRM_API = "https://router.project-osrm.org";

// ============================================
// ROUTE CALCULATION (Backend)
// ============================================

/**
 * Get route between two points using OSRM
 * @param {Array} start - [longitude, latitude]
 * @param {Array} end - [longitude, latitude]
 * @returns {Promise} Route data with distance and duration
 */
async function getRoute(start, end) {
  try {
    const coords = `${start[0]},${start[1]};${end[0]},${end[1]}`;
    const response = await fetch(
      `${OSRM_API}/route/v1/driving/${coords}?overview=full&geometries=geojson`
    );

    if (!response.ok) {
      throw new Error("Failed to fetch route from OSRM");
    }

    const data = await response.json();

    if (data.routes && data.routes.length > 0) {
      const route = data.routes[0];
      return {
        distance: route.distance / 1000, // Convert to km
        duration: Math.round(route.duration / 60), // Convert to minutes
        geometry: route.geometry,
        coordinates: route.geometry.coordinates,
      };
    }

    throw new Error("No route found");
  } catch (error) {
    console.error("OSRM Error:", error);
    throw error;
  }
}

// ============================================
// GEOCODING (Backend)
// ============================================

/**
 * Convert address to coordinates using Nominatim
 * @param {String} address - Address string to geocode
 * @returns {Promise} Coordinates and address details
 */
async function geocodeAddress(address) {
  try {
    const encodedAddress = encodeURIComponent(address);
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodedAddress}&format=json`
    );

    if (!response.ok) {
      throw new Error("Failed to geocode address");
    }

    const data = await response.json();

    if (data.length > 0) {
      const result = data[0];
      return {
        latitude: parseFloat(result.lat),
        longitude: parseFloat(result.lon),
        address: result.display_name,
        boundingbox: result.boundingbox,
      };
    }

    throw new Error("Address not found");
  } catch (error) {
    console.error("Geocoding Error:", error);
    throw error;
  }
}

/**
 * Convert coordinates to address using Nominatim
 * @param {Number} latitude - Latitude
 * @param {Number} longitude - Longitude
 * @returns {Promise} Address and details
 */
async function reverseGeocode(latitude, longitude) {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
    );

    if (!response.ok) {
      throw new Error("Failed to reverse geocode");
    }

    const data = await response.json();

    return {
      address: data.address.road || data.display_name,
      fullAddress: data.display_name,
      details: data.address,
    };
  } catch (error) {
    console.error("Reverse Geocoding Error:", error);
    throw error;
  }
}

// ============================================
// DISTANCE CALCULATION (Backend)
// ============================================

/**
 * Calculate straight-line distance between two points (Haversine)
 * @param {Array} point1 - [latitude, longitude]
 * @param {Array} point2 - [latitude, longitude]
 * @returns {Number} Distance in kilometers
 */
function haversineDistance(point1, point2) {
  const [lat1, lon1] = point1;
  const [lat2, lon2] = point2;
  const R = 6371; // Earth's radius in km

  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// ============================================
// EXAMPLE: EXPRESS ROUTES
// ============================================

/**
 * Usage example for Express backend
 * Add these routes to your server.js or routes file
 */

function setupMapRoutes(app) {
  // Get route between two coordinates
  app.post("/api/route", async (req, res) => {
    try {
      const { start, end } = req.body; // [{lon, lat}, {lon, lat}]

      if (!start || !end) {
        return res
          .status(400)
          .json({ error: "Start and end coordinates required" });
      }

      const route = await getRoute([start.lon, start.lat], [end.lon, end.lat]);

      res.json({
        success: true,
        data: route,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Geocode an address
  app.post("/api/geocode", async (req, res) => {
    try {
      const { address } = req.body;

      if (!address) {
        return res.status(400).json({ error: "Address required" });
      }

      const result = await geocodeAddress(address);

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Reverse geocode coordinates
  app.post("/api/reverse-geocode", async (req, res) => {
    try {
      const { latitude, longitude } = req.body;

      if (!latitude || !longitude) {
        return res
          .status(400)
          .json({ error: "Latitude and longitude required" });
      }

      const result = await reverseGeocode(latitude, longitude);

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Calculate distance for pricing
  app.post("/api/calculate-fare", async (req, res) => {
    try {
      const { start, end, pricePerKm } = req.body;

      if (!start || !end || !pricePerKm) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const route = await getRoute([start.lon, start.lat], [end.lon, end.lat]);
      const fare = route.distance * pricePerKm;

      res.json({
        success: true,
        data: {
          distance: route.distance,
          duration: route.duration,
          fare: fare.toFixed(2),
        },
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
}

// ============================================
// EXPORTS
// ============================================

module.exports = {
  getRoute,
  geocodeAddress,
  reverseGeocode,
  haversineDistance,
  setupMapRoutes,
};
