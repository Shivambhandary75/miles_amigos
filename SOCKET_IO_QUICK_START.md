# Socket.IO Real-Time Location Tracking - Quick Setup Guide

## What Was Added

### Backend Changes
1. **Socket.IO Server** - Added to `server.js`
   - Handles real-time location events
   - Manages ride location rooms
   - Broadcasts location updates to all participants

2. **New Socket Events**:
   - `join-ride`: Join location tracking for a ride
   - `location-update`: Send your live location
   - `leave-ride`: Stop tracking
   - `locations-update`: Receive all live locations

3. **New Endpoint** - `GET /api/users/me`
   - Returns current user ID for socket authentication

### Frontend Changes

1. **Socket Utility** (`client/src/utils/socket.js`)
   - `initSocket()`: Initialize socket connection
   - `joinRide()`: Join a ride's location room
   - `updateLocation()`: Send location to server
   - `onLocationsUpdate()`: Listen for location updates
   - `leaveRide()`: Leave a ride

2. **Enhanced LiveMapNew Component**
   - Automatic geolocation tracking
   - Socket.IO integration
   - Dual path fetching and display
   - Real-time location updates

3. **Enhanced MapLibreMap Component**
   - Renders dual paths (driver + passenger routes)
   - Shows live location markers
   - Displays path legend
   - Shows coordinate information overlay

## How It Works

### For Drivers
1. Offers a ride with start/end location
2. When passenger accepts, driver enters live map
3. Driver's location tracked and broadcast to passengers
4. Driver route shown in solid blue
5. Passenger routes shown in dashed green

### For Passengers
1. Books a ride with their specific pickup/drop
2. Enters live map after driver accepts
3. Passenger location tracked and visible to driver
4. Their custom route shown in dashed green
5. Driver's route shown in solid blue

## Installation Steps

### 1. Install Dependencies (Already Done)
```bash
# Server
npm install socket.io

# Client
npm install socket.io-client
```

### 2. Environment Setup (Optional)
Add to `.env` files:
```bash
# Server .env
CLIENT_URL=http://localhost:5173
PORT=5000

# Client .env
VITE_SOCKET_URL=http://localhost:5000
```

### 3. Start Services
```bash
# Terminal 1: Server
cd server
npm run dev

# Terminal 2: Client
cd client
npm run dev
```

## Key Features

### 1. Live Location Updates
- GPS coordinates update every 5 seconds
- Blue animated marker for driver
- Green markers for passengers
- Coordinates displayed on map

### 2. Dual Path Visualization
- Driver route: Solid blue line
- Passenger route: Dashed green line
- Both routes visible simultaneously
- Color-coded legend on map

### 3. Real-Time Synchronization
- Updates broadcast to all ride participants
- Sub-second latency
- Automatic reconnection
- Location history maintained

### 4. Smart Passenger Location
- Passenger sees their custom pickup/drop
- Not the full driver route
- Their route separately calculated
- Accurate for passenger experience

## Testing

### Test Scenario 1: Single Driver, Single Passenger
1. Create driver account, offer ride
2. Create passenger account, join ride
3. Both open "Live Map" from dashboard
4. Location markers appear and update
5. Both routes visible on map

### Test Scenario 2: Multiple Passengers
1. Driver offers ride
2. Passenger 1 joins with location A→B
3. Passenger 2 joins with location C→D
4. All three see dual/triple paths on map

## Map Legend

| Element | Meaning | Color |
|---------|---------|-------|
| Solid line | Driver's complete route | Blue (#3b82f6) |
| Dashed line | Passenger's route | Green (#10b981) |
| Animated circle | Driver current position | Blue (pulsing) |
| Static circle | Passenger position | Green |
| Coordinates | GPS location display | Text overlay |

## Troubleshooting

### No locations showing up?
1. Check browser allows geolocation
2. Verify both users in same ride
3. Check socket connection: Open browser DevTools → Console
4. Look for `[Socket] Connected to server`

### Dual paths not visible?
1. Check ride has valid start/end locations
2. Verify passenger has startLocation/endLocation
3. Check MapLibre console for rendering errors
4. OSRM API might be slow - wait 5 seconds

### Socket connection fails?
1. Verify server running on port 5000
2. Check VITE_SOCKET_URL is correct
3. Look for CORS errors in console
4. Ensure CLIENT_URL matches client origin

## Performance Tips

- Geolocation updates every 5-10 seconds
- Socket connection uses auto-reconnect
- Map updates debounced
- Markers efficiently managed
- Clean up on ride end

## Next Steps (Optional Enhancements)

1. **Route Deviation Detection**
   - Alert if driver deviates from route
   - Show suggested path back

2. **Historical Tracking**
   - Save all location points
   - Show ride replay after completion
   - Analytics dashboard

3. **ETA Calculation**
   - Real-time ETA updates
   - Based on current location and speed
   - Account for traffic

4. **Ride Analytics**
   - Distance traveled
   - Average speed
   - Time taken vs estimated
   - Fuel/cost calculations

## Browser Support

- Chrome 70+
- Firefox 60+
- Safari 12+
- Edge 79+

Note: HTTPS required for geolocation on production (except localhost)

## File Structure

```
client/
├── src/
│   ├── utils/
│   │   ├── socket.js (NEW)
│   │   └── mapService.js (updated)
│   └── components/
│       ├── MapLibreMap.jsx (updated)
│       └── dashboard/
│           └── LiveMapNew.jsx (updated)

server/
├── server.js (updated)
└── src/
    └── routes/
        └── userRoutes.js (updated)
```

## Documentation Reference

See `SOCKET_IO_INTEGRATION.md` for detailed technical documentation.
