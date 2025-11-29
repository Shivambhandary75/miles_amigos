export async function getRoute(startCoords, endCoords) {
  const [startLng, startLat] = startCoords;
  const [endLng, endLat] = endCoords;

  const params = new URLSearchParams({
    start: `${startLng},${startLat}`,
    end: `${endLng},${endLat}`
  });

  const url = `/api/geocode/route?${params.toString()}`;

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
