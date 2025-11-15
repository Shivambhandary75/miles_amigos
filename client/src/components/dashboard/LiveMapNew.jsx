import { useState, useEffect } from 'react'
import MapLibreMap from '../MapLibreMap'
import { getRoute } from '../../utils/mapService'
import ratingIcon from '../../assets/icons8-rating-50.png'
import location from '../../assets/icons8-location-50.png'

export default function LiveMap() {
  const [currentRide, setCurrentRide] = useState({
    from: 'Downtown Station',
    to: 'Airport Terminal',
    driver: 'Sarah Johnson',
    status: 'On the way',
    progress: 65,
    rating: 4.8,
    eta: '12 min',
    startCoords: [77.6245, 12.9352], // Bangalore downtown [lon, lat]
    endCoords: [77.7099, 13.1939],   // Bangalore airport
  })

  const [routeInfo, setRouteInfo] = useState(null)
  const [selectedTileServer, setSelectedTileServer] = useState('openStreetMap')

  const nearbyRides = [
    { id: 1, from: 'Mall District', to: 'Beach Road', seats: 2, rating: 4.7, distance: '0.5 km away', lat: 12.9352, lon: 77.6245 },
    { id: 2, from: 'Tech Park', to: 'Downtown', seats: 1, rating: 4.9, distance: '1.2 km away', lat: 12.9716, lon: 77.6412 },
    { id: 3, from: 'Airport', to: 'City Center', seats: 3, rating: 4.5, distance: '0.8 km away', lat: 13.1939, lon: 77.7099 },
  ]

  const driverMarkers = [
    {
      title: 'Sarah Johnson',
      description: 'Current Driver - Rating 4.8★',
      latitude: 12.96,
      longitude: 77.63,
    },
    ...nearbyRides.map(ride => ({
      title: `${ride.from} → ${ride.to}`,
      description: `${ride.seats} seats • ${ride.rating}★ • ${ride.distance}`,
      latitude: ride.lat,
      longitude: ride.lon,
    })),
  ]

  const handleRouteChange = (route) => {
    setRouteInfo({
      distance: route.distance,
      duration: route.duration,
    })
  }

  const handleTileServerChange = (server) => {
    setSelectedTileServer(server)
  }

  return (
    <section>
      <div className="mb-10">
        <h1 className="text-4xl font-bold text-white mb-2">
          🗺️ Live Map
        </h1>
        <p className="text-gray-400">Track rides using open-source maps (OSM + OSRM routing)</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Map Container */}
        <div className="lg:col-span-3">
          <div className="relative rounded-2xl overflow-hidden shadow-2xl shadow-blue-500/20 border border-white/10 bg-white/5 h-[500px]">
            <MapLibreMap
              startLocation={currentRide.startCoords}
              endLocation={currentRide.endCoords}
              onRouteChange={handleRouteChange}
              tileServer={selectedTileServer}
              showRoute={true}
              markers={driverMarkers}
              zoom={12}
            />

            {/* Current Ride Info Overlay */}
            <div className="absolute bottom-4 left-4 bg-gray-900/90 backdrop-blur-md border border-white/20 p-4 rounded-lg w-64">
              <h3 className="text-white font-semibold mb-2 flex items-center gap-2">
                <span className="text-lg">🚗</span> {currentRide.driver}
              </h3>
              <div className="space-y-1 text-sm text-gray-300">
                <p className="flex items-center gap-2">
                  <img src={location} alt="From" className="w-4 h-4" />
                  From: {currentRide.from}
                </p>
                <p className="flex items-center gap-2">
                  <img src={location} alt="To" className="w-4 h-4" />
                  To: {currentRide.to}
                </p>
                <p className="flex items-center gap-2">
                  <img src={ratingIcon} alt="Rating" className="w-4 h-4" />
                  Rating: {currentRide.rating}⭐
                </p>
              </div>

              {/* Progress Bar */}
              <div className="mt-3">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-400">{currentRide.status}</span>
                  <span className="text-green-400">{currentRide.progress}%</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-green-500 to-blue-500 h-full transition-all"
                    style={{ width: `${currentRide.progress}%` }}
                  />
                </div>
              </div>

              <p className="text-xs text-yellow-400 mt-2 font-semibold">⏱️ ETA: {currentRide.eta}</p>
            </div>

            {/* Tile Server Selector */}
            <div className="absolute top-4 right-4 flex gap-2">
              {['openStreetMap', 'openTopoMap', 'cartoDB'].map(server => (
                <button
                  key={server}
                  onClick={() => handleTileServerChange(server)}
                  className={`px-3 py-1 rounded text-xs font-semibold transition ${
                    selectedTileServer === server
                      ? 'bg-blue-600 text-white'
                      : 'bg-white/10 text-gray-300 hover:bg-white/20'
                  }`}
                >
                  {server === 'openStreetMap' ? 'OSM' : server === 'openTopoMap' ? 'Topo' : 'CartoDB'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Nearby Rides Sidebar */}
        <div className="space-y-4">
          <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 backdrop-blur-lg p-6 rounded-2xl border border-blue-500/30">
            <h3 className="text-lg font-bold text-white mb-4">📍 Nearby Rides</h3>
            <div className="space-y-3">
              {nearbyRides.map(ride => (
                <div key={ride.id} className="bg-white/5 hover:bg-white/10 p-3 rounded-lg cursor-pointer transition border border-white/10">
                  <p className="text-sm font-semibold text-white">{ride.from}</p>
                  <p className="text-xs text-gray-400 mb-2">→ {ride.to}</p>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-green-400">💺 {ride.seats} seats</span>
                    <span className="text-yellow-400">⭐ {ride.rating}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{ride.distance}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Route Information */}
          {routeInfo && (
            <div className="bg-gradient-to-br from-green-500/10 to-green-600/5 backdrop-blur-lg p-6 rounded-2xl border border-green-500/30">
              <h3 className="text-lg font-bold text-white mb-4">📊 Route Info</h3>
              <div className="space-y-2 text-sm">
                <p className="text-gray-300">
                  <span className="text-green-400 font-semibold">Distance:</span> {routeInfo.distance.toFixed(2)} km
                </p>
                <p className="text-gray-300">
                  <span className="text-green-400 font-semibold">Duration:</span> {routeInfo.duration} min
                </p>
                <p className="text-gray-400 text-xs mt-3">
                  Using OpenStreetMap + OSRM routing
                </p>
              </div>
            </div>
          )}

          {/* Map Info */}
          <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 backdrop-blur-lg p-6 rounded-2xl border border-purple-500/30">
            <h3 className="text-sm font-bold text-white mb-3">🔍 Map Details</h3>
            <div className="text-xs text-gray-400 space-y-2">
              <p>✓ Open-source tiles</p>
              <p>✓ Free routing</p>
              <p>✓ Real-time navigation</p>
              <p>✓ Multiple map styles</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
