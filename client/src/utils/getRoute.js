export async function getRoute(startCoords, endCoords) {
  const [startLng, startLat] = startCoords;
  const [endLng, endLat] = endCoords;

  const url = `https://router.project-osrm.org/route/v1/driving/${startLng},${startLat};${endLng},${endLat}?overview=full&geometries=geojson`;

  const res = await fetch(url);
  const data = await res.json();

  if (!data.routes || data.routes.length === 0) return null;

  return data.routes[0].geometry.coordinates; // polyline array
}
