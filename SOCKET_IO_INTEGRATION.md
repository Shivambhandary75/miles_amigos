# Real-Time Location Tracking with Socket.IO

## Overview
This system implements advanced Socket.IO integration for real-time location tracking of both drivers and passengers during active rides. The map displays dual paths with different colors and shows live locations with animated markers.

## Features

### 1. Real-Time Location Tracking
- **Driver Location**: Blue marker with real-time position updates
- **Passenger Locations**: Green markers showing each passenger's live position
- **Geolocation API**: Continuous location polling while ride is active

### 2. Dual Path Visualization
- **Driver Route**: Solid blue line showing the driver's planned route
- **Passenger Route**: Dashed green line showing the passenger's specific pickup/drop points
- Different routes rendered with distinct colors and styles

### 3. Live Location Indicators
- Animated blue pulse for driver location
- Static green markers for passengers
- Location coordinates displayed on map overlay
- Automatic marker updates as locations change

## Server Implementation

### Socket.IO Setup (`server.js`)
```javascript
const io = socketIO(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST']
  }
})
```

### Socket Events

#### `join-ride`
- **Purpose**: Join a specific ride's location tracking room
- **Data**: `{ rideId, userId, role }`
- **Action**: Creates/joins room and receives current location data

#### `location-update`
- **Purpose**: Send real-time location updates
- **Data**: `{ rideId, userId, role, lat, lng }`
- **Action**: Updates location in memory and broadcasts to all ride participants

#### `leave-ride`
- **Purpose**: Leave a ride's location tracking room
- **Data**: `{ rideId, userId }`
- **Action**: Removes user from room and cleans up location data

#### `locations-update` (Event - Received by Client)
- **Purpose**: Receive all live locations for the ride
- **Data**: `{ driver: {lat, lng, userId}, passengers: [{lat, lng, userId}] }`
- **Triggers**: When any location in the ride is updated

## Client Implementation

### Socket Utilities (`utils/socket.js`)

#### `initSocket()`
- Initializes Socket.IO connection with authentication
- Returns singleton socket instance

#### `joinRide(rideId, userId, role)`
- Joins a ride's location tracking room
- Role can be 'driver' or 'passenger'

#### `updateLocation(rideId, userId, role, lat, lng)`
- Sends current location to server
- Called from geolocation watcher

#### `onLocationsUpdate(callback)`
- Listens for location updates from server
- Callback receives `{ driver: {...}, passengers: [...] }`

#### `leaveRide(rideId, userId)`
- Leaves a ride's location tracking room

### Component Integration (`components/dashboard/LiveMapNew.jsx`)

#### Geolocation Tracking
```javascript
useEffect(() => {
  if (navigator.geolocation) {
    const id = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude: lat, longitude: lng } = position.coords
        updateLocation(currentRide.id, userId, userRole, lat, lng)
      },
      (error) => console.error('Geolocation error:', error),
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    )
    setWatchId(id)
  }
}, [currentRide, userId, userRole])
```

#### Dual Path Fetching
```javascript
const fetchDualPaths = async (ride, passengerEntry = null) => {
  const driverRoute = await getRoute(driverStart, driverEnd)
  const passengerRoute = passengerEntry 
    ? await getRoute(passengerStart, passengerEnd)
    : null
  setDualPaths({
    driver: driverRoute?.coordinates || [],
    passenger: passengerRoute?.coordinates || []
  })
}
```

### Map Component Enhancement (`components/MapLibreMap.jsx`)

#### Dual Path Rendering
- **Driver Route**: Solid blue line (`#3b82f6`)
- **Passenger Route**: Dashed green line (`#10b981`) with 4px dash pattern

#### Live Location Markers
- **Driver**: Blue animated circle with pulse effect
- **Passengers**: Green static circles
- Markers update dynamically as locations change

#### Path Legend
- Shows route types with color indicators
- Displays in top-left corner of map

#### Location Info Overlay
- Shows current GPS coordinates for driver and passengers
- Updates in real-time with socket events

## Configuration

### Environment Variables
```
VITE_SOCKET_URL=http://localhost:5000
CLIENT_URL=http://localhost:5173
PORT=5000
```

### Geolocation Permissions
- Browser must grant location permission
- iOS Safari requires HTTPS
- Uses high accuracy mode with 5-second timeout

## Data Flow

```
1. User joins ride
   └─> Component calls joinRide()
   └─> Socket joins room `ride-{rideId}`
   └─> Receives initial location data

2. Location update triggered
   └─> navigator.geolocation triggers callback
   └─> updateLocation() sends to server
   └─> Server broadcasts to all room members
   └─> Components receive via onLocationsUpdate()

3. Map visualization
   └─> Dual paths fetched via OSRM
   └─> Live markers rendered from socket data
   └─> Legend shows route types
   └─> Info overlay shows coordinates
```

## Performance Considerations

- **Location Poll Interval**: 5-10 seconds recommended
- **Socket Room Size**: Typical rides have 1-6 participants
- **Memory Management**: Locations cleaned up when ride ends
- **Map Updates**: Markers updated efficiently with MapLibre GL

## Security Notes

- Socket events validated against authenticated user ID
- Ride participation verified before sending location
- JWT token passed in socket auth
- Geolocation data only sent to authenticated connections

## Usage Example

```javascript
// In component
import { joinRide, updateLocation, onLocationsUpdate } from '../../utils/socket'

// Join ride
joinRide(rideId, userId, 'driver')

// Listen for location updates
const handleLocationsUpdate = (locations) => {
  setLiveLocations(locations)
  // Update map with new positions
}
onLocationsUpdate(handleLocationsUpdate)

// Start tracking location
navigator.geolocation.watchPosition((position) => {
  updateLocation(rideId, userId, 'driver', 
    position.coords.latitude, 
    position.coords.longitude)
})
```

## Testing

### Local Testing
1. Start server: `npm run dev` (in server directory)
2. Start client: `npm run dev` (in client directory)
3. Create two user sessions in different browser windows
4. Driver offers ride, passenger joins
5. Both enter live map - location updates in real-time

### Browser Console
- Socket connection logged: `[Socket] Connected to server`
- Location updates logged: `📍 Current location: lat, lng`
- Location received: `📍 Received location update: {...}`

## Troubleshooting

### Locations not updating
- Check browser console for geolocation permission
- Verify VITE_SOCKET_URL matches server address
- Ensure both users in same ride (same rideId)

### Map not showing dual paths
- Check OSRM API availability
- Verify ride data includes passenger startLocation/endLocation
- Check MapLibreMap console for rendering errors

### Socket connection fails
- Verify server CORS settings
- Check CLIENT_URL environment variable
- Ensure port 5000 is accessible

## Future Enhancements

- Historical location tracking/replay
- Estimated arrival time (ETA) calculation
- Route deviation detection
- Real-time traffic integration
- Ride analytics dashboard
