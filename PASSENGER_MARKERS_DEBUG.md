# Passenger Pickup/Drop Markers - Debug Guide

## Changes Made

### 1. Backend (rideController.js)
- Updated `getRideHistory` query to populate `passengers.user` details
- Now returns passenger name along with ride data

### 2. Frontend (MapLibreMap.jsx)
- Added new prop: `passengerPoints` (array of {pickupCoords, dropCoords, passengerName})
- Created separate useEffect for passenger pickup/drop markers
- Markers are now separate from live location markers (prevents deletion issues)
- Cyan markers = Pickup locations
- Orange markers = Drop-off locations

### 3. Frontend (LiveMapNew.jsx)
- Added `passengerPoints` state
- Builds passenger points array when user is driver
- Passes to MapLibreMap with: `passengerPoints={userRole === "driver" ? passengerPoints : null}`

## Console Logs to Check

When loading a driver's live map, check browser console for:

```
🚗 [DRIVER] Building passenger points:
   Total passengers: X
   Accepted passengers: Y
   Passenger data: [...]
   Passenger 1:
     - Name: ...
     - Pickup: [lng, lat]
     - Drop: [lng, lat]

📍 [DEBUG] passengerPoints state changed:
   Value: [...]
   Is Array: true
   Length: Y

🎯 [MapLibreMap] Props received:
   passengerPoints: [...]

🎯 [Passenger Points Effect] Running with: [...]
   ✅ Proceeding to add markers
   🗺️ Adding passenger pickup/drop markers: [...]
   📍 Passenger 1:
      ✅ Pickup marker added
      ✅ Drop marker added
```

## Expected Result

On the map, you should see:
- 🔵 Blue pulsing circle = Driver's live location
- 🟢 Green circle = Passenger's current location
- 🟦 **Cyan circle** = Passenger's pickup point (NEW)
- 🟧 **Orange circle** = Passenger's drop-off point (NEW)

## If Markers Still Don't Show

1. Open Browser DevTools → Console
2. Check for any error messages
3. Verify the structure of `passengerPoints` data
4. Check that passenger.startLocation and passenger.endLocation have lat/lng
5. Verify map is initialized with `map.current` available

## Test Steps

1. Create a ride as Driver A (with future date like 2025-11-24)
2. Have Driver B request and accept as Passenger
3. Go to Live Map as Driver A
4. Should see:
   - Passenger's current location (green)
   - **NEW: Passenger's pickup point (cyan)**
   - **NEW: Passenger's drop-off point (orange)**
   - Passenger info in sidebar with coordinates
