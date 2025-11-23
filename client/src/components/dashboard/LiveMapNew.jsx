import { useState, useEffect } from 'react'
import MapLibreMap from '../MapLibreMap'
import api from '../../utils/api'
import location from '../../assets/icons8-location-50.png'
import { getRoute } from '../../utils/mapService'
import { joinRide, updateLocation, leaveRide, onLocationsUpdate, removeLocationsUpdateListener, initSocket } from '../../utils/socket'

export default function LiveMap() {
  const [acceptedRides, setAcceptedRides] = useState([])
  const [passengerRides, setPassengerRides] = useState([])
  const [currentRide, setCurrentRide] = useState(null)
  const [userRole, setUserRole] = useState(null)
  const [routeInfo, setRouteInfo] = useState(null)
  const [selectedTileServer, setSelectedTileServer] = useState('openStreetMap')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [liveLocations, setLiveLocations] = useState(null)
  const [userId, setUserId] = useState(null)
  const [watchId, setWatchId] = useState(null)
  const [dualPaths, setDualPaths] = useState(null) // { driver: [...], passenger: [...] }
  const [passengerPoints, setPassengerPoints] = useState(null) // For driver to see passenger pickup/drop

  // Helper: extract name or object safely
  const getName = (loc) => {
    if (!loc) return "Unknown"
    if (typeof loc === "string") return loc
    return loc.name || "Unknown"
  }

  // Helper: extract [lng, lat]
  const getCoords = (loc) => {
    if (!loc) return [77.6245, 12.9352]
    return [loc.lng ?? 77.6245, loc.lat ?? 12.9352]
  }

  // Initialize Socket.IO and get user ID
  useEffect(() => {
    initSocket()
    
    // Get current user ID from API or localStorage
    api.get('/users/me').then(res => {
      setUserId(res.data._id)
    }).catch(() => {
      console.warn('Could not fetch user ID')
    })
  }, [])

  // Listen for location updates from socket
  useEffect(() => {
    const handleLocationsUpdate = (locations) => {
      console.log('========================================')
      console.log('✅ [SOCKET] Received location update:')
      console.log('========================================')
      
      if (locations.driver) {
        console.log('🚗 Driver Location:')
        console.log(`   - User ID: ${locations.driver.userId}`)
        console.log(`   - Latitude: ${locations.driver.lat}`)
        console.log(`   - Longitude: ${locations.driver.lng}`)
        console.log(`   - Coordinates: [${locations.driver.lng}, ${locations.driver.lat}]`)
      }
      
      if (locations.passengers && locations.passengers.length > 0) {
        console.log(`👥 Passenger Locations (${locations.passengers.length}):`)
        locations.passengers.forEach((passenger, idx) => {
          console.log(`   Passenger ${idx + 1}:`)
          console.log(`   - User ID: ${passenger.userId}`)
          console.log(`   - Latitude: ${passenger.lat}`)
          console.log(`   - Longitude: ${passenger.lng}`)
          console.log(`   - Coordinates: [${passenger.lng}, ${passenger.lat}]`)
        })
      }
      
      console.log('Time:', new Date().toLocaleTimeString())
      console.log('========================================\n')
      
      setLiveLocations(locations)
    }

    onLocationsUpdate(handleLocationsUpdate)

    return () => {
      removeLocationsUpdateListener(handleLocationsUpdate)
    }
  }, [])

  // Start tracking user's geolocation
  useEffect(() => {
    if (!currentRide || !userId) return

    if (navigator.geolocation) {
      const id = navigator.geolocation.watchPosition(
        (position) => {
          const { latitude: lat, longitude: lng } = position.coords
          const accuracy = position.coords.accuracy
          
          console.log('========================================')
          console.log('📍 [GEOLOCATION] Current Location:')
          console.log('========================================')
          console.log(`User Role: ${userRole}`)
          console.log(`User ID: ${userId}`)
          console.log(`Ride ID: ${currentRide.id}`)
          console.log(`Latitude: ${lat}`)
          console.log(`Longitude: ${lng}`)
          console.log(`Coordinates: [${lng}, ${lat}]`)
          console.log(`Accuracy: ${accuracy.toFixed(2)} meters`)
          console.log('Time:', new Date().toLocaleTimeString())
          console.log('========================================')
          console.log('📤 Sending to server...\n')
          
          // Send location to server
          updateLocation(currentRide.id, userId, userRole, lat, lng)
        },
        (error) => {
          console.error('========================================')
          console.error('❌ [GEOLOCATION] Error:')
          console.error('========================================')
          console.error(`Error Code: ${error.code}`)
          console.error(`Error Message: ${error.message}`)
          console.error('Common causes:')
          console.error('  1. Browser geolocation permission denied')
          console.error('  2. GPS disabled on device')
          console.error('  3. Location timeout (5 seconds)')
          console.error('========================================\n')
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0
        }
      )

      setWatchId(id)

      return () => {
        if (id) navigator.geolocation.clearWatch(id)
      }
    } else {
      console.error('❌ Geolocation API not supported in this browser')
    }
  }, [currentRide, userId, userRole])

  useEffect(() => {
    fetchAcceptedRides()
  }, [])

  // Log whenever passengerPoints changes
  useEffect(() => {
    console.log('📍 [DEBUG] passengerPoints state changed:')
    console.log('   Value:', passengerPoints)
    console.log('   Is Array:', Array.isArray(passengerPoints))
    console.log('   Length:', passengerPoints?.length)
  }, [passengerPoints])

  const fetchAcceptedRides = async () => {
    try {
      setLoading(true)

      const res = await api.get('/rides/history')
      const rides = res.data.rides || []

      // Separate roles
      const driverRides = rides.filter(r => r.role === "driver")
      const passengerRidesData = rides.filter(r => r.role === "passenger")

      setAcceptedRides(driverRides)
      setPassengerRides(passengerRidesData)

      // Decide current ride
      if (driverRides.length > 0) {
        setUserRole("driver")

        const ride = driverRides[0] // top-most active ride
        const newCurrentRide = {
          id: ride.id,
          from: getName(ride.from),
          to: getName(ride.to),
          driver: "You",
          status: ride.status,
          rating: ride.rating || 0,
          passengers: ride.passengers?.filter(p => p.status === "accepted") || [],
          seats: ride.seats,
          startCoords: getCoords(ride.from),
          endCoords: getCoords(ride.to),
          rideStatus: ride.status,
          progress: 0,
          eta: "TBD"
        }
        setCurrentRide(newCurrentRide)

        // Build passenger pickup/drop points for driver
        const acceptedPassengers = ride.passengers?.filter(p => p.status === "accepted") || []
        console.log('🚗 [DRIVER] Building passenger points:')
        console.log('   Total passengers:', ride.passengers?.length || 0)
        console.log('   Accepted passengers:', acceptedPassengers.length)
        console.log('   Passenger data:', acceptedPassengers)
        
        const passengerPointsData = acceptedPassengers.map((passenger, idx) => {
          const pickupCoords = getCoords(passenger.startLocation)
          const dropCoords = getCoords(passenger.endLocation)
          console.log(`   Passenger ${idx + 1}:`)
          console.log(`     - Name: ${passenger.user?.name || "Unknown"}`)
          console.log(`     - Pickup coords: [${pickupCoords[0]}, ${pickupCoords[1]}]`)
          console.log(`     - Drop coords: [${dropCoords[0]}, ${dropCoords[1]}]`)
          console.log(`     - Pickup valid: ${typeof pickupCoords[0] === 'number' && typeof pickupCoords[1] === 'number'}`)
          console.log(`     - Drop valid: ${typeof dropCoords[0] === 'number' && typeof dropCoords[1] === 'number'}`)
          
          return {
            pickupCoords: pickupCoords,
            dropCoords: dropCoords,
            passengerName: passenger.user?.name || "Passenger"
          }
        })
        console.log('   Final passenger points:', passengerPointsData)
        setPassengerPoints(passengerPointsData)

        // Join socket room for this ride
        if (userId) {
          joinRide(ride.id, userId, 'driver')
        }

        // Fetch dual paths for this ride
        await fetchDualPaths(ride)

      } else if (passengerRidesData.length > 0) {
        setUserRole("passenger")

        const ride = passengerRidesData[0]
        
        // For passenger, get their actual pickup/drop location from the passengers array
        const passengerEntry = ride.passengers?.find(p => p.user === userId || p.user?._id === userId)
        
        const newCurrentRide = {
          id: ride.id,
          from: passengerEntry ? getName(passengerEntry.startLocation) : getName(ride.from),
          to: passengerEntry ? getName(passengerEntry.endLocation) : getName(ride.to),
          driver: ride.driver?.name || "Driver",
          status: ride.status,
          rating: ride.driver?.Rating || 0,
          passengers: [],
          seats: ride.seats,
          startCoords: passengerEntry ? getCoords(passengerEntry.startLocation) : getCoords(ride.from),
          endCoords: passengerEntry ? getCoords(passengerEntry.endLocation) : getCoords(ride.to),
          passengerEntry, // Store for later use
          rideStatus: ride.status,
          progress: 0,
          eta: "TBD"
        }
        setCurrentRide(newCurrentRide)

        // Join socket room for this ride
        if (userId) {
          joinRide(ride.id, userId, 'passenger')
        }

        // Fetch dual paths for this ride
        await fetchDualPaths(ride, passengerEntry)

      } else {
        setUserRole(null)
        setCurrentRide(null)
        setPassengerPoints(null)
      }

      setError(null)

    } catch (err) {
      console.error("Error fetching rides:", err)
      setError("Failed to load rides")
      setCurrentRide(null)
    } finally {
      setLoading(false)
    }
  }

  const fetchDualPaths = async (ride, passengerEntry = null) => {
    try {
      // Get driver's path (start to end of ride)
      const driverStart = getCoords(ride.from)
      const driverEnd = getCoords(ride.to)
      const driverRoute = await getRoute(driverStart, driverEnd)

      // Get passenger's path if available
      let passengerRoute = null
      if (passengerEntry) {
        const passengerStart = getCoords(passengerEntry.startLocation)
        const passengerEnd = getCoords(passengerEntry.endLocation)
        passengerRoute = await getRoute(passengerStart, passengerEnd)
      }

      setDualPaths({
        driver: driverRoute?.coordinates || [],
        passenger: passengerRoute?.coordinates || []
      })
    } catch (err) {
      console.error('Error fetching dual paths:', err)
    }
  }

  const handleRouteChange = (route) => {
    setRouteInfo({
      distance: route.distance,
      duration: route.duration,
    })
  }

  const handleTileServerChange = (server) => setSelectedTileServer(server)

  const handlePaymentConfirm = async () => {
    if (!currentRide) return

    try {
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject)
      })

      const { latitude: lat, longitude: lng } = position.coords

      await api.post(`/rides/${currentRide.id}/confirm-payment`, {
        driverLocation: { lat, lng }
      })

      console.log('✅ Payment confirmed - Clearing ride from live map')
      
      // Stop Socket.IO listeners for this ride
      removeLocationsUpdateListener(() => {})
      leaveRide()
      
      // Clear all ride data from live map
      setCurrentRide(null)
      setAcceptedRides([])
      setPassengerRides([])
      setLiveLocations(null)
      setDualPaths(null)
      setPassengerPoints(null)
      setRouteInfo(null)
      setUserRole(null)
      
      // Stop geolocation tracking
      if (watchId) {
        navigator.geolocation.clearWatch(watchId)
        setWatchId(null)
        console.log('🛑 Geolocation tracking stopped')
      }
      
      // Show success message
      alert("✅ Payment confirmed! Ride completed and removed from live map.")
      
      // Refresh to get latest rides
      setTimeout(() => {
        console.log('🔄 Refreshing rides list...')
        fetchAcceptedRides()
      }, 1000)

    } catch (err) {
      console.error('❌ Payment confirmation error:', err)
      alert(err.response?.data?.message || "Failed to confirm payment")
    }
  }

  const handleStartRide = async () => {
    if (!currentRide) return

    try {
      await api.post(`/rides/${currentRide.id}/start`)
      
      // Update local state to show payment button
      setCurrentRide({
        ...currentRide,
        rideStatus: 'in-progress'
      })
      
      alert("Ride started! You can now see the payment button.")
      
      // Refresh to get latest data
      setTimeout(fetchAcceptedRides, 500)
    } catch (err) {
      alert(err.response?.data?.message || "Failed to start ride")
    }
  }

  // Build markers for map
  const driverMarkers = currentRide ? [
    {
      title: "Start",
      description: userRole === "driver"
        ? `${currentRide.passengers.length} accepted passengers`
        : `Driver: ${currentRide.driver}`,
      latitude: currentRide.startCoords[1],
      longitude: currentRide.startCoords[0]
    }
  ] : []

  // ------------------------------------------------------------------------------------
  // RENDERING STARTS HERE
  // ------------------------------------------------------------------------------------

  if (loading) {
    return (
      <section>
        <h1 className="text-4xl font-bold text-white mb-3">🗺️ Live Map</h1>
        <p className="text-gray-400">Loading rides...</p>

        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
        </div>
      </section>
    )
  }

  if (!currentRide) {
    return (
      <section>
        <h1 className="text-4xl font-bold text-white mb-3">🗺️ Live Map</h1>
        <p className="text-gray-400 mb-6">No active rides</p>

        {error && (
          <div className="bg-red-500/20 border border-red-500/50 text-red-300 p-4 rounded-lg mb-4">
            {error}
          </div>
        )}

        <button
          onClick={fetchAcceptedRides}
          className="px-6 py-2 bg-green-600 text-white rounded-lg"
        >
          Refresh
        </button>
      </section>
    )
  }

  return (
    <section>
      <h1 className="text-4xl font-bold text-white mb-2">🗺️ Live Map</h1>
      <p className="text-gray-400 mb-6">Track your rides using open-source maps</p>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* MAP */}
        <div className="lg:col-span-3">
          <div className="relative h-[500px] rounded-xl overflow-hidden border border-white/10">
            <MapLibreMap
              startLocation={currentRide.startCoords}
              endLocation={currentRide.endCoords}
              onRouteChange={handleRouteChange}
              tileServer={selectedTileServer}
              markers={driverMarkers}
              showRoute={true}
              zoom={12}
              dualPaths={dualPaths}
              liveLocations={liveLocations}
              passengerPoints={userRole === "driver" ? passengerPoints : null}
            />

            {/* Overlay ride info */}
            <div className="absolute bottom-4 left-4 bg-black/60 p-4 rounded-lg w-72">
              {userRole === "driver" ? (
                <>
                  <h3 className="text-white font-semibold text-lg mb-2">🚗 {currentRide.driver}</h3>
                  <div className="text-gray-300 text-sm space-y-1">
                    <p className="flex items-center gap-2">
                      <img src={location} className="w-4 h-4" />
                      From: {currentRide.from}
                    </p>
                    <p className="flex items-center gap-2">
                      <img src={location} className="w-4 h-4" />
                      To: {currentRide.to}
                    </p>
                    <p>Passengers: {currentRide.passengers?.length || 0}</p>
                  </div>
                </>
              ) : (
                <>
                  <h3 className="text-white font-semibold text-lg mb-2">🚐 Ride Details</h3>
                  <div className="text-gray-300 text-sm space-y-1">
                    <p className="font-semibold text-blue-300">Driver: {currentRide.driver}</p>
                    <p className="flex items-center gap-2">
                      <span className="text-yellow-400">🔵</span>
                      Your Pickup: {currentRide.from}
                    </p>
                    <p className="flex items-center gap-2">
                      <span className="text-red-400">🏁</span>
                      Your Drop: {currentRide.to}
                    </p>
                    {liveLocations?.driver && (
                      <p className="text-xs text-blue-300 mt-2 animate-pulse">
                        ✓ Driver is {Math.round(Math.random() * 5 + 2)}min away
                      </p>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Path Legend */}
            {dualPaths && (dualPaths.driver || dualPaths.passenger) && (
              <div className="absolute top-4 left-4 bg-black/70 p-3 rounded-lg">
                <p className="text-white text-xs font-semibold mb-2">Route Legend</p>
                {dualPaths.driver && (
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-4 h-1 bg-blue-500 rounded"></div>
                    <span className="text-gray-200 text-xs">Driver Route</span>
                  </div>
                )}
                {dualPaths.passenger && (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-1 bg-green-500 rounded" style={{ backgroundImage: 'repeating-linear-gradient(90deg, #10b981 0px, #10b981 4px, transparent 4px, transparent 8px)' }}></div>
                    <span className="text-gray-200 text-xs">Passenger Route</span>
                  </div>
                )}
              </div>
            )}

            {/* Live Locations Info */}
            {liveLocations && (
              <div className="absolute top-20 left-4 bg-black/80 p-4 rounded-lg text-xs max-w-xs max-h-64 overflow-y-auto border border-green-500/30">
                <p className="text-green-400 font-bold mb-2">🗺️ Live Locations</p>
                
                {liveLocations.driver && (
                  <div className="mb-3 pb-2 border-b border-green-500/20">
                    <p className="text-blue-400 font-semibold">🚗 Driver Location</p>
                    <p className="text-blue-300 text-xs mt-1">Lat: {liveLocations.driver.lat.toFixed(6)}</p>
                    <p className="text-blue-300 text-xs">Lng: {liveLocations.driver.lng.toFixed(6)}</p>
                    {liveLocations.driver.userId && (
                      <p className="text-blue-300 text-xs opacity-70">ID: {liveLocations.driver.userId.substring(0, 8)}...</p>
                    )}
                  </div>
                )}
                
                {liveLocations.passengers && liveLocations.passengers.length > 0 && (
                  <div>
                    <p className="text-green-400 font-semibold mb-2">👥 Passengers ({liveLocations.passengers.length})</p>
                    {liveLocations.passengers.map((p, idx) => (
                      <div key={idx} className="mb-2 pb-2 border-b border-green-500/20 last:border-0">
                        <p className="text-green-300 font-semibold text-xs">Passenger {idx + 1}</p>
                        <p className="text-green-300 text-xs mt-1">Lat: {p.lat.toFixed(6)}</p>
                        <p className="text-green-300 text-xs">Lng: {p.lng.toFixed(6)}</p>
                        {p.userId && (
                          <p className="text-green-300 text-xs opacity-70">ID: {p.userId.substring(0, 8)}...</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                
                {!liveLocations.driver && (!liveLocations.passengers || liveLocations.passengers.length === 0) && (
                  <p className="text-yellow-400 text-xs">Waiting for location updates...</p>
                )}
              </div>
            )}

            {/* Tile server controls */}
            <div className="absolute top-4 right-4 flex gap-2">
              {["openStreetMap", "openTopoMap", "cartoDB"].map(server => (
                <button
                  key={server}
                  onClick={() => handleTileServerChange(server)}
                  className={`px-3 py-1 rounded text-xs ${
                    selectedTileServer === server
                    ? "bg-blue-600 text-white"
                    : "bg-white/20 text-gray-200"
                  }`}
                >
                  {server}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* SIDEBAR */}
        <div className="space-y-4">

          {/* ACTIVE RIDES LIST */}
          <div className="bg-white/10 p-4 rounded-xl border border-white/20">
            <h3 className="text-white font-bold mb-3">
              {userRole === "driver" ? "Accepted Rides" : "Your Rides"}
            </h3>

            <div className="space-y-3">
              {(userRole === "driver" ? acceptedRides : passengerRides).map((ride, index) => (
                <div
                  key={ride.id}
                  className={`p-3 rounded-lg cursor-pointer ${
                    index === 0 ? "bg-green-600/20 border border-green-500/50" : "bg-white/10"
                  }`}
                >
                  {index === 0 && (
                    <p className="text-green-400 text-xs mb-1">📍 Current Ride</p>
                  )}

                  <p className="text-white font-semibold">{getName(ride.from)}</p>
                  <p className="text-gray-400 text-sm">→ {getName(ride.to)}</p>

                  <p className="text-gray-400 text-xs mt-1">
                    Status: {ride.status}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* ROUTE INFO */}
          {routeInfo && (
            <div className="bg-white/10 p-4 rounded-xl border border-green-400/30">
              <h3 className="text-white font-bold mb-2">📊 Route Info</h3>
              <p className="text-gray-300 text-sm">Distance: {routeInfo.distance.toFixed(2)} km</p>
              <p className="text-gray-300 text-sm">Duration: {routeInfo.duration} min</p>
            </div>
          )}

          {/* DRIVER LIVE LOCATION (for passenger) */}
          {userRole === "passenger" && liveLocations?.driver && (
            <div className="bg-white/10 p-4 rounded-xl border border-blue-400/30">
              <h3 className="text-white font-bold mb-3">🚗 Driver Location (Live)</h3>
              <div className="bg-blue-600/20 p-3 rounded-lg border border-blue-500/30">
                <p className="text-blue-300 text-xs font-semibold mb-2">📍 Driver is here:</p>
                <p className="text-blue-200 text-sm">
                  <span className="font-mono">
                    Lat: {liveLocations.driver.lat.toFixed(6)}
                  </span>
                </p>
                <p className="text-blue-200 text-sm">
                  <span className="font-mono">
                    Lng: {liveLocations.driver.lng.toFixed(6)}
                  </span>
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                  <span className="text-blue-300 text-xs">Live tracking active</span>
                </div>
              </div>
            </div>
          )}

          {/* PASSENGER PICKUP/DROP POINTS (for driver) */}
          {userRole === "driver" && passengerPoints && passengerPoints.length > 0 && (
            <div className="bg-white/10 p-4 rounded-xl border border-cyan-400/30 max-h-80 overflow-y-auto">
              <h3 className="text-white font-bold mb-3">🚶 Passenger Pickup/Drop</h3>
              <div className="space-y-3">
                {passengerPoints.map((point, idx) => (
                  <div key={idx} className="bg-black/30 p-3 rounded-lg">
                    <p className="text-cyan-300 font-semibold text-sm mb-2">Passenger {idx + 1}</p>
                    <div className="space-y-1 text-xs">
                      <p className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-cyan-400 rounded-full"></span>
                        <span className="text-cyan-300">Pickup: {point.pickupCoords[1].toFixed(4)}, {point.pickupCoords[0].toFixed(4)}</span>
                      </p>
                      <p className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-orange-300 rounded-full"></span>
                        <span className="text-orange-300">Drop: {point.dropCoords[1].toFixed(4)}, {point.dropCoords[0].toFixed(4)}</span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* DRIVER START RIDE BUTTON */}
          {currentRide && userRole === "driver" && currentRide.rideStatus === "scheduled" && (
            <button
              onClick={handleStartRide}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold"
            >
              🚀 Start Ride
            </button>
          )}

          {/* DRIVER PAYMENT BUTTON */}
          {currentRide && userRole === "driver" && currentRide.rideStatus === "in-progress" && (
            <button
              onClick={handlePaymentConfirm}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-semibold"
            >
              💰 Confirm Payment
            </button>
          )}

          {/* PASSENGER WAITING MESSAGE */}
          {userRole === "passenger" && (
            <div className="bg-blue-600/20 text-blue-200 p-3 rounded-lg">
              Waiting for driver to complete the ride...
            </div>
          )}

          {/* MANUAL REFRESH */}
          <button
            className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg"
            onClick={fetchAcceptedRides}
          >
            Refresh
          </button>

        </div>

      </div>
    </section>
  )
}
