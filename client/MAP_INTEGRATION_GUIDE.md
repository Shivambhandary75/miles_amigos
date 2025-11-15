# Open Source Map Integration Guide

This guide explains how to use the open-source mapping libraries integrated into Miles Amigos.

## 📦 Installed Libraries

### 1. **MapLibre GL**

- High-performance vector map library
- Supports custom map styles
- WebGL-based rendering
- Fork of Mapbox GL (fully open source)

### 2. **Leaflet**

- Lightweight, easy-to-use mapping library
- Perfect for simple map applications
- Raster map support
- Large plugin ecosystem

### 3. **OSRM (Open Source Routing Machine)**

- Free routing engine
- Real-time route calculation
- Distance and duration calculation
- Powered by OpenStreetMap

### 4. **LibreMap / OpenStreetMap (OSM)**

- Free, editable map tiles
- Multiple style options:
  - **OSM Standard**: Default OpenStreetMap style
  - **OpenTopoMap**: Topographic map
  - **CartoDB**: Clean, minimal style

## 🗺️ Usage Examples

### Basic MapLibre Map

```jsx
import MapLibreMap from "../components/MapLibreMap";

export default function MyMap() {
  return (
    <div style={{ height: "400px", width: "100%" }}>
      <MapLibreMap
        startLocation={[77.5946, 12.9716]} // [longitude, latitude]
        endLocation={[77.7099, 13.1939]}
        showRoute={true}
        zoom={12}
      />
    </div>
  );
}
```

### Using Leaflet Map

```jsx
import LeafletMap from "../components/LeafletMap";

export default function MyMap() {
  return (
    <div style={{ height: "400px", width: "100%" }}>
      <LeafletMap
        startLocation={[77.5946, 12.9716]} // [longitude, latitude]
        endLocation={[77.7099, 13.1939]}
        tileServer="openStreetMap"
      />
    </div>
  );
}
```

### Using Map Service Functions

```jsx
import { getRoute, geocodeAddress, reverseGeocode } from "../utils/mapService";

// Get route between two points
const route = await getRoute([77.5946, 12.9716], [77.7099, 13.1939]);
console.log(`Distance: ${route.distance} km, Duration: ${route.duration} min`);

// Convert address to coordinates
const location = await geocodeAddress("Bangalore");
console.log(location); // { address, latitude, longitude }

// Convert coordinates to address
const address = await reverseGeocode(12.9716, 77.5946);
console.log(address); // { address, fullAddress, latitude, longitude }
```

## 🛣️ Map Service Functions

### `getRoute(start, end)`

Calculates the optimal route between two points.

```javascript
const route = await getRoute([77.5946, 12.9716], [77.7099, 13.1939]);
// Returns:
// {
//   distance: 25.3, // km
//   duration: 35,   // minutes
//   geometry: GeoJSON,
//   coordinates: [[lon, lat], ...]
// }
```

### `geocodeAddress(address)`

Converts an address to coordinates.

```javascript
const location = await geocodeAddress("Bangalore Airport");
// Returns:
// {
//   address: "Bangalore Airport, Devanahalli...",
//   latitude: 13.1939,
//   longitude: 77.7099
// }
```

### `reverseGeocode(latitude, longitude)`

Converts coordinates to a readable address.

```javascript
const address = await reverseGeocode(12.9716, 77.5946);
// Returns:
// {
//   address: "Bangalore",
//   fullAddress: "Bangalore, Karnataka...",
//   latitude: 12.9716,
//   longitude: 77.5946
// }
```

### `haversineDistance(point1, point2)`

Calculates straight-line distance between two points.

```javascript
const distance = haversineDistance([12.9716, 77.5946], [13.1939, 77.7099]);
console.log(distance); // Distance in km
```

### `getNearbyPOI(latitude, longitude, radius)`

Finds nearby points of interest.

```javascript
const poi = await getNearbyPOI(12.9716, 77.5946, 1000);
// Returns array of nearby locations within 1km radius
```

## 🎨 Tile Server Options

Available tile servers (free):

1. **openStreetMap** (default)

   - Standard OSM tiles
   - Most detailed
   - URL: `https://tile.openstreetmap.org/{z}/{x}/{y}.png`

2. **openTopoMap**

   - Topographic details
   - Mountains and terrain
   - URL: `https://a.tile.opentopomap.org/{z}/{x}/{y}.png`

3. **cartoDB**
   - Clean, minimal style
   - Light background
   - URL: `https://cartodb-basemaps-a.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png`

### Switch Tile Server

```jsx
const [tileServer, setTileServer] = useState('openStreetMap')

<MapLibreMap
  tileServer={tileServer}
  ...
/>

<button onClick={() => setTileServer('openTopoMap')}>
  Switch to Topo Map
</button>
```

## 📍 Component Props

### MapLibreMap

```jsx
<MapLibreMap
  startLocation={[lon, lat]} // Start coordinates
  endLocation={[lon, lat]} // End coordinates
  onRouteChange={(route) => {}} // Route callback
  tileServer="openStreetMap" // Map style
  showRoute={true} // Show route line
  markers={[
    // Custom markers
    {
      title: "Place Name",
      description: "Description",
      latitude: 12.9716,
      longitude: 77.5946,
    },
  ]}
  onMarkerClick={(marker) => {}} // Marker click handler
  zoom={12} // Initial zoom level
/>
```

### LeafletMap

Same props as MapLibreMap - both components have compatible interfaces.

## 🌐 API Services Used

### OSRM (Routing)

- **Endpoint**: `https://router.project-osrm.org`
- **Free Public Instance**: Yes
- **Rate Limit**: Reasonable (no authentication)
- **Alternative**: Self-hosted OSRM server

### Nominatim (Geocoding)

- **Endpoint**: `https://nominatim.openstreetmap.org`
- **Free Public Instance**: Yes
- **Rate Limit**: 1 request/second
- **Usage Policy**: Credit OpenStreetMap in your app

### OpenStreetMap (Tiles)

- **Multiple Free Tile Servers**: Yes
- **No API Key Required**: Correct
- **Attribution Required**: Yes (in tile config)

## ⚙️ Self-Hosting Options

For production, consider self-hosting:

1. **OSRM Server**

   ```bash
   docker run -d -p 5000:5000 osrm/osrm-backend
   ```

   Then update `OSRM_API` in `mapService.js`

2. **Tile Server**

   ```bash
   docker run -d -p 8080:8080 -v /path/to/data:/data maptiler/tileserver-gl
   ```

3. **Nominatim (Geocoding)**
   ```bash
   docker run -d -p 8080:8080 mediagis/nominatim
   ```

## 🔒 Privacy & Attribution

- **OpenStreetMap**: Requires attribution
- **OSRM**: Free public instance available
- **Nominatim**: Requires rate limiting
- **User Data**: All routing queries are processed locally

## 📦 Installation

If you haven't installed the dependencies yet:

```bash
cd client
npm install maplibre-gl leaflet osrm axios
```

## 🚀 Performance Tips

1. **Lazy Load Maps**: Only initialize when needed
2. **Cache Routes**: Store frequently used routes
3. **Cluster Markers**: Use marker clustering for many points
4. **Optimize Tiles**: Use appropriate zoom levels
5. **Debounce Events**: Throttle route updates

## 🐛 Troubleshooting

### Maps not displaying

- Check browser console for errors
- Verify tile server URLs are accessible
- Ensure MapLibre GL CSS is imported

### Routes not calculating

- Check if coordinates are in [lon, lat] format
- Verify OSRM endpoint is accessible
- Check browser console for API errors

### Slow performance

- Reduce marker count
- Simplify route geometry
- Use appropriate zoom levels
- Consider vector tiles instead of raster

## 📚 Resources

- **MapLibre GL Docs**: https://maplibre.org/
- **Leaflet Docs**: https://leafletjs.com/
- **OSRM Docs**: http://project-osrm.org/
- **OpenStreetMap**: https://www.openstreetmap.org/
- **Nominatim Docs**: https://nominatim.org/

## 📝 Integration in Components

### LiveMap Component

Already updated with MapLibre integration showing:

- Live driver locations
- Route visualization
- Multiple tile servers
- Nearby rides
- Route information

### FindRide Component

Can be updated to show:

- Search results on map
- Pickup/dropoff selection
- Route preview

### OfferRide Component

Can be updated to show:

- Ride route visualization
- Current location
- Destination marker

## 🔄 Next Steps

1. Update LiveMap to use new component ✓
2. Integrate maps into FindRide
3. Integrate maps into OfferRide
4. Add route optimization
5. Implement real-time tracking
6. Add traffic layer (if available)
7. Self-host OSRM for production

---

**Created**: 2025-11-15
**Last Updated**: 2025-11-15
**Status**: Ready for Production
