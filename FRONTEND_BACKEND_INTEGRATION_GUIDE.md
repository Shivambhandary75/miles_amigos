# 🎯 FRONTEND & BACKEND INTEGRATION GUIDE

## How to Use MapLibre GL and OSRM in Frontend & Backend

---

## 📱 FRONTEND USAGE

### **1. Display Map with Routes**

```jsx
import MapLibreMap from "../components/MapLibreMap";

export function RideDetails() {
  const ride = {
    from: { lon: 77.5946, lat: 12.9716 }, // Bangalore
    to: { lon: 77.7099, lat: 13.1939 }, // Airport
  };

  return (
    <MapLibreMap
      startLocation={[ride.from.lon, ride.from.lat]}
      endLocation={[ride.to.lon, ride.to.lat]}
      showRoute={true}
      zoom={12}
    />
  );
}
```

### **2. Calculate Route on Frontend**

```jsx
import { useState } from "react";
import { getRoute } from "../utils/mapService";

export function CalculateRoute() {
  const [routeInfo, setRouteInfo] = useState(null);

  const handleCalculateRoute = async () => {
    const route = await getRoute(
      [77.5946, 12.9716], // Start
      [77.7099, 13.1939] // End
    );
    setRouteInfo(route);
    // Output: {distance: 28.50, duration: 45, geometry: {...}}
  };

  return (
    <div>
      <button onClick={handleCalculateRoute}>Calculate Route</button>
      {routeInfo && (
        <p>
          Distance: {routeInfo.distance}km, Duration: {routeInfo.duration}min
        </p>
      )}
    </div>
  );
}
```

### **3. Geocode Addresses on Frontend**

```jsx
import { useState } from "react";
import { geocodeAddress } from "../utils/mapService";

export function LocationSearch() {
  const [address, setAddress] = useState("");
  const [coordinates, setCoordinates] = useState(null);

  const handleSearch = async () => {
    const result = await geocodeAddress(address);
    setCoordinates(result);
    // Output: {latitude, longitude, address}
  };

  return (
    <div>
      <input
        value={address}
        onChange={(e) => setAddress(e.target.value)}
        placeholder="Enter address"
      />
      <button onClick={handleSearch}>Search</button>
      {coordinates && (
        <p>
          Location: {coordinates.latitude}, {coordinates.longitude}
        </p>
      )}
    </div>
  );
}
```

---

## 🖥️ BACKEND USAGE

### **1. Setup in Your Express Server**

**In `server.js` or `index.js`:**

```javascript
const express = require("express");
const { setupMapRoutes } = require("./src/utils/mapRouting");

const app = express();
app.use(express.json());

// Setup map-related routes
setupMapRoutes(app);

app.listen(5000, () => {
  console.log("Server running on port 5000");
});
```

### **2. API Endpoints Available**

Once you add `setupMapRoutes(app)`, you get these endpoints:

#### **Calculate Route**

```bash
POST /api/route
Content-Type: application/json

{
  "start": {"lon": 77.5946, "lat": 12.9716},
  "end": {"lon": 77.7099, "lat": 13.1939}
}

Response:
{
  "success": true,
  "data": {
    "distance": 28.50,
    "duration": 45,
    "geometry": {...},
    "coordinates": [...]
  }
}
```

#### **Geocode Address**

```bash
POST /api/geocode
Content-Type: application/json

{
  "address": "Vidhana Soudha Bangalore"
}

Response:
{
  "success": true,
  "data": {
    "latitude": 13.1918,
    "longitude": 77.5947,
    "address": "Vidhana Soudha, Bangalore...",
    "boundingbox": [...]
  }
}
```

#### **Reverse Geocode**

```bash
POST /api/reverse-geocode
Content-Type: application/json

{
  "latitude": 12.9716,
  "longitude": 77.5946
}

Response:
{
  "success": true,
  "data": {
    "address": "Street name...",
    "fullAddress": "Full address details...",
    "details": {...}
  }
}
```

#### **Calculate Fare**

```bash
POST /api/calculate-fare
Content-Type: application/json

{
  "start": {"lon": 77.5946, "lat": 12.9716},
  "end": {"lon": 77.7099, "lat": 13.1939},
  "pricePerKm": 50
}

Response:
{
  "success": true,
  "data": {
    "distance": 28.50,
    "duration": 45,
    "fare": "1425.00"
  }
}
```

---

## 🔄 FULL FRONTEND-BACKEND FLOW

### **Example: Book a Ride**

**Step 1: Frontend - User enters pickup and destination**

```jsx
const [pickup, setPickup] = useState("");
const [destination, setDestination] = useState("");

const handleSearch = async () => {
  // Get coordinates from user input
  const pickupCoords = await geocodeAddress(pickup);
  const destCoords = await geocodeAddress(destination);

  // Send to backend to calculate fare
  const response = await fetch("/api/calculate-fare", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      start: { lon: pickupCoords.longitude, lat: pickupCoords.latitude },
      end: { lon: destCoords.longitude, lat: destCoords.latitude },
      pricePerKm: 50,
    }),
  });

  const fare = await response.json();
  console.log("Calculated Fare:", fare.data.fare);
};
```

**Step 2: Backend - Calculate distance and fare**

```javascript
// Server processes the request
POST / api / calculate - fare;
// Calls OSRM API
// Returns distance, duration, and fare
```

**Step 3: Frontend - Show map and book**

```jsx
// Display map with route
<MapLibreMap
  startLocation={[pickupCoords.longitude, pickupCoords.latitude]}
  endLocation={[destCoords.longitude, destCoords.latitude]}
  showRoute={true}
/>

// Show calculated fare
<p>Fare: ₹{fare.data.fare}</p>

// User clicks "Book Ride"
<button onClick={bookRide}>Book Ride</button>
```

**Step 4: Backend - Save ride to database**

```javascript
app.post("/api/book-ride", async (req, res) => {
  const { pickupLat, pickupLon, destLat, destLon, fare } = req.body;

  // Save to database
  const ride = await Ride.create({
    pickupLocation: { latitude: pickupLat, longitude: pickupLon },
    destinationLocation: { latitude: destLat, longitude: destLon },
    distance: 28.5,
    duration: 45,
    fare: fare,
  });

  res.json({ success: true, rideId: ride.id });
});
```

---

## 🎨 USE CASES

### **1. Booking Rides**

```
Frontend: Show map, get coordinates from user input
Backend: Calculate distance, duration, fare
Database: Store ride details with coordinates
```

### **2. Driver Navigation**

```
Frontend: Display real-time map
Backend: Calculate optimal route using OSRM
Websocket: Send driver updates to frontend
```

### **3. Ride History**

```
Frontend: Show past rides on map
Backend: Fetch rides from database, show on map
Store: Save coordinates for each ride
```

### **4. Pricing Calculation**

```
Frontend: Show estimated price before booking
Backend: Use OSRM distance + rate per km
Database: Store actual distance charged
```

### **5. Location Search**

```
Frontend: User types location name
Backend: Geocode using Nominatim
Database: Cache popular locations
```

---

## 📦 DEPENDENCIES NEEDED

### Frontend (Already installed)

```json
{
  "maplibre-gl": "^4.0.0",
  "leaflet": "^1.9.4",
  "react-map-gl": "^7.1.7"
}
```

### Backend (Need to install)

```bash
npm install node-fetch@2
```

Or if using Node.js 18+, fetch is built-in:

```javascript
// No need to require node-fetch, use native fetch
```

---

## 🚀 COMPLETE EXAMPLE

### **Backend: server.js**

```javascript
const express = require("express");
const { setupMapRoutes, getRoute } = require("./src/utils/mapRouting");

const app = express();
app.use(express.json());

// Map routes
setupMapRoutes(app);

// Custom route for creating rides
app.post("/api/rides", async (req, res) => {
  try {
    const { from, to, driver, price } = req.body;

    // Calculate route details
    const route = await getRoute(
      [from.longitude, from.latitude],
      [to.longitude, to.latitude]
    );

    // Save ride to database
    const ride = {
      id: Date.now(),
      from,
      to,
      driver,
      price,
      distance: route.distance,
      duration: route.duration,
      createdAt: new Date(),
    };

    res.json({ success: true, ride });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(5000, () => console.log("Server on port 5000"));
```

### **Frontend: CreateRide.jsx**

```jsx
import { useState } from "react";
import { geocodeAddress } from "../utils/mapService";
import MapLibreMap from "../components/MapLibreMap";

export function CreateRide() {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [route, setRoute] = useState(null);

  const handleCreateRide = async () => {
    // Get coordinates
    const fromCoords = await geocodeAddress(from);
    const toCoords = await geocodeAddress(to);

    // Get route details from backend
    const response = await fetch("/api/route", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        start: { lon: fromCoords.longitude, lat: fromCoords.latitude },
        end: { lon: toCoords.longitude, lat: toCoords.latitude },
      }),
    });

    const result = await response.json();
    setRoute(result.data);
  };

  return (
    <div>
      <input placeholder="From" onChange={(e) => setFrom(e.target.value)} />
      <input placeholder="To" onChange={(e) => setTo(e.target.value)} />
      <button onClick={handleCreateRide}>Create Ride</button>

      {route && (
        <>
          <MapLibreMap
            startLocation={[fromCoords.longitude, fromCoords.latitude]}
            endLocation={[toCoords.longitude, toCoords.latitude]}
            showRoute={true}
          />
          <p>
            Distance: {route.distance}km | Duration: {route.duration}min
          </p>
        </>
      )}
    </div>
  );
}
```

---

## ✨ KEY POINTS

✅ **Frontend**: Use mapService functions for instant calculations  
✅ **Backend**: Use mapRouting functions for server-side processing  
✅ **Database**: Store coordinates with rides for history  
✅ **APIs**: All free (OSRM, Nominatim, OpenStreetMap)  
✅ **No Auth**: No API keys needed  
✅ **Scalable**: Works with any number of rides

---

## 🎯 SUMMARY

You can now:

1. **Display maps** - Frontend with MapLibre GL ✅
2. **Calculate routes** - Frontend or Backend with OSRM ✅
3. **Geocode addresses** - Frontend or Backend with Nominatim ✅
4. **Calculate fares** - Backend with distance data ✅
5. **Store ride data** - Database with all coordinates ✅

**Everything is ready to use!** 🚀
