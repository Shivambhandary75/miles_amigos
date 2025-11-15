# 🗺️ Open Source Maps Integration - Quick Start

## ✅ What's Been Added

Your Miles Amigos project now has complete open-source mapping integration:

### 📦 New Dependencies (in package.json)

```json
{
  "maplibre-gl": "^4.0.0",
  "leaflet": "^1.9.4",
  "osrm": "^1.1.0",
  "react-map-gl": "^7.1.7"
}
```

### 📁 New Files Created

1. **`src/utils/mapService.js`** - Core map utilities

   - Route calculation (OSRM)
   - Geocoding/Reverse geocoding (Nominatim)
   - Distance calculation
   - Points of Interest search

2. **`src/components/MapLibreMap.jsx`** - Vector map component

   - High-performance WebGL rendering
   - Route visualization
   - Custom markers
   - Multiple tile server support

3. **`src/components/LeafletMap.jsx`** - Lightweight map component

   - Simple, easy-to-use interface
   - Raster tiles
   - Alternative to MapLibre

4. **`src/components/dashboard/LiveMapNew.jsx`** - Enhanced LiveMap

   - Fully integrated with OSRM routing
   - Multiple tile servers (OSM, TopoMap, CartoDB)
   - Live driver tracking
   - Route information display

5. **`MAP_INTEGRATION_GUIDE.md`** - Comprehensive documentation

## 🚀 Installation

Install the new dependencies:

```bash
cd client
npm install
```

## 💡 How to Use

### Option 1: Use MapLibre (Recommended for production)

```jsx
import MapLibreMap from "../components/MapLibreMap";

export default function MyRideMap() {
  return (
    <div style={{ height: "500px", width: "100%" }}>
      <MapLibreMap
        startLocation={[77.5946, 12.9716]} // [longitude, latitude]
        endLocation={[77.7099, 13.1939]}
        showRoute={true}
        tileServer="openStreetMap"
        zoom={12}
      />
    </div>
  );
}
```

### Option 2: Use Leaflet (Good for simple maps)

```jsx
import LeafletMap from "../components/LeafletMap";

export default function MySimpleMap() {
  return (
    <div style={{ height: "500px", width: "100%" }}>
      <LeafletMap
        startLocation={[77.5946, 12.9716]}
        endLocation={[77.7099, 13.1939]}
      />
    </div>
  );
}
```

### Option 3: Use Utility Functions

```jsx
import { getRoute, geocodeAddress } from "../utils/mapService";

// Get route
const route = await getRoute([77.5946, 12.9716], [77.7099, 13.1939]);
console.log(`Distance: ${route.distance} km`);
console.log(`Duration: ${route.duration} min`);

// Convert address to coordinates
const location = await geocodeAddress("Bangalore Airport");
console.log(location);
```

## 🎨 Features

### ✅ Routing

- Real-time route calculation using OSRM
- Distance and duration estimates
- Polyline route visualization

### ✅ Geocoding

- Address to coordinates conversion
- Coordinates to address conversion
- POI search

### ✅ Tile Servers (All Free)

- OpenStreetMap (standard)
- OpenTopoMap (topographic)
- CartoDB (minimal)

### ✅ Components

- Vector maps (MapLibre GL)
- Raster maps (Leaflet)
- Both support: markers, routes, popups

### ✅ No Backend Required

- All services are public/free
- No API keys needed
- No authentication required

## 📍 Integration Points

### Update LiveMap Component

Replace the old LiveMap with the new LiveMapNew:

```jsx
// Dashboard.jsx
import LiveMapNew from "./dashboard/LiveMapNew";

// In your component
<LiveMapNew />;
```

### Add Maps to FindRide

```jsx
import MapLibreMap from "../MapLibreMap";

// Show route before booking
<MapLibreMap
  startLocation={fromCoords}
  endLocation={toCoords}
  showRoute={true}
/>;
```

### Add Maps to OfferRide

```jsx
// Show your ride route
<MapLibreMap startLocation={rideStart} endLocation={rideEnd} />
```

## 🌐 API Endpoints Used (All Free & Open Source)

1. **OSRM Routing** - Route calculation

   - Endpoint: `https://router.project-osrm.org`
   - No API key needed

2. **Nominatim** - Geocoding

   - Endpoint: `https://nominatim.openstreetmap.org`
   - Free (respect rate limits: 1 req/sec)

3. **OpenStreetMap Tiles** - Map tiles
   - Multiple free servers available
   - No API key needed

## ⚙️ Configuration

### Change Default Location

In `mapService.js`:

```javascript
center: [77.5946, 12.9716], // Change this to your default city
```

### Use Different Tile Server

```jsx
<MapLibreMap
  tileServer="cartoDB"  // or "openTopoMap"
  ...
/>
```

### Self-Host OSRM (Optional)

For production, you can self-host OSRM:

```bash
docker run -d -p 5000:5000 osrm/osrm-backend
```

Then update in `mapService.js`:

```javascript
const OSRM_API = "http://localhost:5000";
```

## 📊 Component Comparison

| Feature           | MapLibre    | Leaflet           |
| ----------------- | ----------- | ----------------- |
| **Performance**   | ⭐⭐⭐⭐⭐  | ⭐⭐⭐⭐          |
| **Customization** | High        | Medium            |
| **Ease of Use**   | Medium      | Easy              |
| **File Size**     | ~300KB      | ~150KB            |
| **Modern**        | Yes (WebGL) | Yes (Established) |
| **Vector Tiles**  | Yes         | No                |
| **Raster Tiles**  | Yes         | Yes               |

**Recommendation**: Use MapLibre for production, Leaflet for prototyping.

## 🔍 Testing

### Test Route Calculation

```javascript
// Open browser console
import { getRoute } from "./utils/mapService";
const route = await getRoute([77.5946, 12.9716], [77.7099, 13.1939]);
console.log(route);
```

### Test Geocoding

```javascript
import { geocodeAddress } from "./utils/mapService";
const location = await geocodeAddress("MG Road Bangalore");
console.log(location);
```

## 🚨 Common Issues

### Issue: Maps not showing

- **Solution**: Check if `height` is set on map container
- Verify tile server URLs are accessible

### Issue: Routes not appearing

- **Solution**: Check coordinate format is [longitude, latitude]
- Verify OSRM endpoint is reachable

### Issue: Slow loading

- **Solution**: Use vector tiles (MapLibre) instead of raster
- Reduce marker count
- Implement marker clustering

## 📚 Next Steps

1. ✅ Update existing LiveMap component
2. ✅ Add routing preview to FindRide
3. ✅ Show ride route in OfferRide
4. ✅ Add real-time driver tracking
5. ⏳ Implement traffic layer
6. ⏳ Add offline map support
7. ⏳ Self-host OSRM for production

## 📖 Full Documentation

See `MAP_INTEGRATION_GUIDE.md` for comprehensive documentation with:

- Detailed API references
- Advanced usage examples
- Self-hosting guide
- Troubleshooting

## 🎉 You're All Set!

Your app now has:

- ✅ Open-source maps (OpenStreetMap)
- ✅ Free routing (OSRM)
- ✅ Geocoding services (Nominatim)
- ✅ Multiple map styles
- ✅ No API keys required
- ✅ Production-ready components

Start using maps in your components today! 🗺️
