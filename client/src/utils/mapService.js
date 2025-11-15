/**
 * Map Service - Handles map and routing operations using OSRM and MapLibre GL
 */

// OSRM API endpoint (you can use a public instance or self-hosted)
const OSRM_API = "https://router.project-osrm.org";

// LibreMap tile server (open street map tiles)
export const TILE_SERVERS = {
  openStreetMap: {
    url: "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution: "© OpenStreetMap contributors",
    maxZoom: 19,
  },
  openTopoMap: {
    url: "https://a.tile.opentopomap.org/{z}/{x}/{y}.png",
    attribution: "© OpenTopoMap",
    maxZoom: 17,
  },
  cartoDB: {
    url: "https://cartodb-basemaps-a.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png",
    attribution: "© CartoDB",
    maxZoom: 19,
  },
};

/**
 * Get route between two points using OSRM
 * @param {Array} start - [longitude, latitude]
 * @param {Array} end - [longitude, latitude]
 * @returns {Promise} Route data with distance and duration
 */
export async function getRoute(start, end) {
  try {
    const coords = `${start[0]},${start[1]};${end[0]},${end[1]}`;
    const response = await fetch(
      `${OSRM_API}/route/v1/driving/${coords}?overview=full&geometries=geojson`
    );

    if (!response.ok) {
      throw new Error("Failed to fetch route");
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

    return null;
  } catch (error) {
    console.error("Error fetching route:", error);
    return null;
  }
}

/**
 * Get multiple routes (isochrones/reachability)
 * @param {Array} point - [longitude, latitude]
 * @param {Number} radius - Radius in meters
 * @returns {Promise} Reachable area polygon
 */
export async function getReachableArea(point, radius = 5000) {
  try {
    const response = await fetch(
      `${OSRM_API}/table/v1/driving/${point[0]},${point[1]}?scale=${radius}`
    );

    if (!response.ok) {
      throw new Error("Failed to fetch reachable area");
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching reachable area:", error);
    return null;
  }
}

/**
 * Reverse geocode coordinates to address (using Nominatim)
 * @param {Number} latitude
 * @param {Number} longitude
 * @returns {Promise} Address information
 */
export async function reverseGeocode(latitude, longitude) {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
    );

    if (!response.ok) {
      throw new Error("Failed to reverse geocode");
    }

    const data = await response.json();
    return {
      address: data.address?.road || data.address?.city || "Unknown location",
      fullAddress: data.display_name,
      latitude: data.lat,
      longitude: data.lon,
    };
  } catch (error) {
    console.error("Error reverse geocoding:", error);
    return null;
  }
}

/**
 * Geocode address to coordinates (using Nominatim)
 * @param {String} address
 * @returns {Promise} Coordinates
 */
export async function geocodeAddress(address) {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        address
      )}`
    );

    if (!response.ok) {
      throw new Error("Failed to geocode address");
    }

    const data = await response.json();

    if (data && data.length > 0) {
      const result = data[0];
      return {
        address: result.display_name,
        latitude: parseFloat(result.lat),
        longitude: parseFloat(result.lon),
      };
    }

    return null;
  } catch (error) {
    console.error("Error geocoding address:", error);
    return null;
  }
}

/**
 * Calculate straight-line distance between two points (in km)
 * @param {Array} point1 - [lat, lon]
 * @param {Array} point2 - [lat, lon]
 * @returns {Number} Distance in kilometers
 */
export function haversineDistance(point1, point2) {
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

/**
 * Get nearby points of interest
 * @param {Number} latitude
 * @param {Number} longitude
 * @param {Number} radius - Search radius in meters
 * @returns {Promise} Array of nearby locations
 */
export async function getNearbyPOI(latitude, longitude, radius = 1000) {
  try {
    const bbox = `${longitude - radius / 111000},${
      latitude - radius / 111000
    },${longitude + radius / 111000},${latitude + radius / 111000}`;
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&amenity=*&viewbox=${bbox}&bounded=1`
    );

    if (!response.ok) {
      throw new Error("Failed to fetch POI");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching POI:", error);
    return [];
  }
}

export default {
  getRoute,
  getReachableArea,
  reverseGeocode,
  geocodeAddress,
  haversineDistance,
  getNearbyPOI,
  TILE_SERVERS,
};
