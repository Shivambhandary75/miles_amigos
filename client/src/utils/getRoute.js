export async function getRoute(startCoords, endCoords) {
  const [startLng, startLat] = startCoords;
  const [endLng, endLat] = endCoords;

  const url = `https://router.project-osrm.org/route/v1/driving/${startLng},${startLat};${endLng},${endLat}?overview=full&geometries=geojson`;

  const res = await fetch(url);
  const data = await res.json();

  if (!data.routes || data.routes.length === 0) return null;

  const route = data.routes[0];
  return {
    coordinates: route.geometry.coordinates, // polyline array
    distance: route.distance / 1000, // Convert to km
    duration: Math.round(route.duration / 60) // Convert to minutes
  };
}
