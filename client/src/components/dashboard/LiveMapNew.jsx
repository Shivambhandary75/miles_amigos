import { useState, useEffect } from 'react'
import MapLibreMap from '../MapLibreMap'
import api from '../../utils/api'
import location from '../../assets/icons8-location-50.png'

export default function LiveMap() {
  const [acceptedRides, setAcceptedRides] = useState([])
  const [passengerRides, setPassengerRides] = useState([])
  const [currentRide, setCurrentRide] = useState(null)
  const [userRole, setUserRole] = useState(null)
  const [routeInfo, setRouteInfo] = useState(null)
  const [selectedTileServer, setSelectedTileServer] = useState('openStreetMap')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

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

  useEffect(() => {
    fetchAcceptedRides()
  }, [])

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
        setCurrentRide({
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
        })

      } else if (passengerRidesData.length > 0) {
        setUserRole("passenger")

        const ride = passengerRidesData[0]
        setCurrentRide({
          id: ride.id,
          from: getName(ride.from),
          to: getName(ride.to),
          driver: ride.driver?.name || "Driver",
          status: ride.status,
          rating: ride.driver?.rating || 0,
          passengers: [],
          seats: ride.seats,
          startCoords: getCoords(ride.from),
          endCoords: getCoords(ride.to),
          rideStatus: ride.status,
          progress: 0,
          eta: "TBD"
        })

      } else {
        setUserRole(null)
        setCurrentRide(null)
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

      alert("Payment confirmed")
      setCurrentRide(null)
      setAcceptedRides([])

      setTimeout(fetchAcceptedRides, 1000)

    } catch (err) {
      alert(err.response?.data?.message || "Failed to confirm payment")
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
            />

            {/* Overlay ride info */}
            <div className="absolute bottom-4 left-4 bg-black/60 p-4 rounded-lg w-64">
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
            </div>

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

          {/* DRIVER PAYMENT BUTTON */}
          {currentRide && userRole === "driver" && currentRide.rideStatus === "in-progress" && (
            <button
              onClick={handlePaymentConfirm}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg"
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
