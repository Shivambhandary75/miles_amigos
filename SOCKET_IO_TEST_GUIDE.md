// Socket.IO Integration Test & Verification Guide
// Run these tests in browser console while using the live map

// ============================================
// TEST 1: Socket Connection
// ============================================
console.log("TEST 1: Socket Connection");
// Open browser DevTools Console while on Live Map
// Look for these messages:
// [Socket] Connected to server ✓
// [Socket] Client connected: socket-id-here (in server terminal) ✓

// ============================================
// TEST 2: Geolocation Permission
// ============================================
console.log("TEST 2: Geolocation Permission");
// Browser should prompt for location permission
// Allow it, then check:
// 📍 Current location: lat, lng (should appear in console)

// ============================================
// TEST 3: Socket Room Join
// ============================================
console.log("TEST 3: Socket Room Join");
// In server terminal, you should see:
// [Socket] User userId (driver/passenger) joined ride rideId ✓

// ============================================
// TEST 4: Location Broadcast
// ============================================
console.log("TEST 4: Location Broadcast");
// Both driver and passenger should receive:
// 📍 Received location update: { driver: {...}, passengers: [...] }

// ============================================
// TEST 5: Map Display
// ============================================
console.log("TEST 5: Map Display");
// Verify:
// □ Map loads without errors
// □ Blue solid line for driver route
// □ Green dashed line for passenger route
// □ Blue animated circle at driver location
// □ Green circles at passenger locations
// □ Path legend visible (top-left corner)
// □ Coordinates overlay shows live positions

// ============================================
// TEST 6: Dual Path Different
// ============================================
console.log("TEST 6: Dual Path Different");
// Verify passenger path is different from driver path
// Driver sees: Full route start → end
// Passenger sees: Pickup location → drop location
// Routes should intersect but not be identical

// ============================================
// MANUAL TEST CHECKLIST
// ============================================
/*
SETUP:
□ Start server: cd server && npm run dev
□ Start client: cd client && npm run dev
□ Open http://localhost:5173

SINGLE DRIVER TEST:
□ Create/login driver account
□ Navigate to "Offer Ride" or "Find Rides"
□ Create a ride from Location A to Location B
□ Go to "Live Map"
□ Check: Map loads with blue route
□ Check: Location marker appears (blue animated dot)
□ Check: Coordinates show in overlay
□ Check: Route legend visible

TWO USER TEST (Driver + Passenger):
□ Create driver account and offer ride A→B
□ Create passenger account in different browser
□ Passenger books ride with custom location C→D
□ Open Live Map on both browsers
□ Verify: Both see two routes (blue solid + green dashed)
□ Verify: Both see two location markers
□ Verify: Coordinates update every 5 seconds
□ Walk with phone (if on mobile):
  □ Check that markers move in real-time
  □ Verify path changes color as you move
  □ Check coordinates update accurately

STRESS TEST:
□ Add 3rd passenger with different route
□ Verify 3 different paths show (if feasible)
□ Check performance remains smooth
□ Verify all markers update without lag

ERROR HANDLING:
□ Turn off GPS during ride
  □ Location updates should stop
  □ Markers freeze at last position
  □ Reconnect GPS
  □ Markers resume updating
□ Close browser tab
  □ Check server shows: leave-ride event
  □ Other users unaffected
□ Disable socket in DevTools
  □ UI shows no updates
  □ No browser console errors

VISUAL VERIFICATION:
□ Blue line: Consistent solid style
□ Green line: Consistent dashed style
□ Markers: Visible at all zoom levels
□ Legend: Readable text and colors
□ Coordinates: Accurate to 4 decimal places
□ Animation: Driver marker pulses
*/

// ============================================
// DEBUG COMMANDS FOR CONSOLE
// ============================================

// Check if socket is connected
if (window.io) {
  console.log("Socket.IO loaded: ✓");
} else {
  console.log("Socket.IO NOT loaded: ✗");
}

// Check localStorage for auth token
const token = localStorage.getItem("authToken");
console.log("Auth token present:", token ? "✓" : "✗");

// Monitor socket events (if accessible)
// Note: Requires modifying socket.js temporarily to expose window.socket
window.addEventListener("message", (event) => {
  if (event.data.type === "socket-event") {
    console.log("Socket event:", event.data.event, event.data.data);
  }
});

// ============================================
// COMMON ISSUES & SOLUTIONS
// ============================================

/*
ISSUE: "Socket.IO not connecting"
SOLUTION:
1. Check server running: visit http://localhost:5000 in browser
2. Check VITE_SOCKET_URL in .env matches server URL
3. Check CORS: origin should match client URL
4. Clear browser cache and restart

ISSUE: "Location not updating"
SOLUTION:
1. Check browser permissions: DevTools → Privacy → Location
2. Ensure geolocation allowed for localhost
3. Check accuracy setting: should be high
4. Wait 5-10 seconds for next update

ISSUE: "Dual paths not showing"
SOLUTION:
1. Verify passenger has startLocation and endLocation
2. Check OSRM API available: https://router.project-osrm.org
3. Look for "Error fetching dual paths" in console
4. Try refreshing page

ISSUE: "Markers not visible on map"
SOLUTION:
1. Check map zoom level (try 12-15)
2. Verify markers have valid lat/lng
3. Check data-live-marker attributes in DevTools
4. Try different map tile server (OSM/Topo/CartoDB)

ISSUE: "Performance lag"
SOLUTION:
1. Reduce location update frequency
2. Lower map zoom level
3. Close other browser tabs
4. Check network - look for 5+ second latency
*/

// ============================================
// API ENDPOINTS TO VERIFY
// ============================================

/*
GET /api/users/me
- Returns: { _id, email, name }
- Used to: Get current user ID for socket
- Test: curl http://localhost:5000/api/users/me -H "Authorization: Bearer TOKEN"

GET /api/rides/history
- Returns: { rides: [...] }
- Used to: Get all rides for map display
- Test: curl http://localhost:5000/api/rides/history -H "Authorization: Bearer TOKEN"

Socket Events:
- emit join-ride: { rideId, userId, role }
- emit location-update: { rideId, userId, role, lat, lng }
- receive locations-update: { driver: {...}, passengers: [...] }
*/

// ============================================
// SAMPLE TEST DATA
// ============================================

/*
DRIVER ROUTE:
Start: 12.9352, 77.6245 (Bangalore center)
End: 13.1939, 77.7099 (Bangalore airport)

PASSENGER 1:
Pickup: 12.9716, 77.5946 (Downtown area)
Drop: 13.1939, 77.7099 (Airport)

PASSENGER 2:
Pickup: 12.9485, 77.6205 (Business district)
Drop: 13.1717, 77.6412 (Tech park)
*/

console.log("Socket.IO Integration Test Guide Loaded ✓");
console.log("See comments above for detailed test instructions");
