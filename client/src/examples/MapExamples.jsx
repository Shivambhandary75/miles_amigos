/**
 * Map Integration Examples
 * Copy and paste these examples into your components
 */

import { useState, useEffect } from 'react'
import MapLibreMap from '../components/MapLibreMap'
import { 
  getRoute, 
  geocodeAddress, 
  reverseGeocode,
  haversineDistance 
} from '../utils/mapService'

// ============================================
// Example 1: Simple Route Display
// ============================================
export function SimpleRouteExample() {
  return (
    <div className="w-full h-96 rounded-lg overflow-hidden">
      <MapLibreMap
        startLocation={[77.5946, 12.9716]} // Bangalore downtown
        endLocation={[77.7099, 13.1939]}   // Bangalore airport
        showRoute={true}
        zoom={12}
      />
    </div>
  )
}

// ============================================
// Example 2: Find Ride with Map Preview
// ============================================
export function FindRideWithMapExample() {

  const [fromCoords, setFromCoords] = useState(null)
  const [toCoords, setToCoords] = useState(null)
  const [fromInput, setFromInput] = useState('')
  const [toInput, setToInput] = useState('')

  const handleSearch = async (e) => {
    e.preventDefault()
    const from = await geocodeAddress(fromInput)
    const to = await geocodeAddress(toInput)
    if (from) setFromCoords([from.longitude, from.latitude])
    if (to) setToCoords([to.longitude, to.latitude])
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleSearch} className="space-y-2">
        <input
          type="text"
          placeholder="From..."
          value={fromInput}
          onChange={(e) => setFromInput(e.target.value)}
          className="w-full px-4 py-2 rounded bg-white/10"
        />
        <input
          type="text"
          placeholder="To..."
          value={toInput}
          onChange={(e) => setToInput(e.target.value)}
          className="w-full px-4 py-2 rounded bg-white/10"
        />
        <button
          type="submit"
          className="w-full px-4 py-2 bg-blue-600 rounded font-semibold"
        >
          Show Route
        </button>
      </form>

      {fromCoords && toCoords && (
        <div className="h-96 rounded-lg overflow-hidden">
          <MapLibreMap
            startLocation={fromCoords}
            endLocation={toCoords}
            showRoute={true}
          />
        </div>
      )}
    </div>
  )
}

// ============================================
// Example 3: Multiple Markers on Map
// ============================================
export function MultipleMarkersExample() {
  const markers = [
    {
      title: 'User Location',
      description: 'Your current location',
      latitude: 12.9716,
      longitude: 77.5946,
    },
    {
      title: 'Friend 1',
      description: 'Alex Smith - Online',
      latitude: 12.9352,
      longitude: 77.6245,
    },
    {
      title: 'Friend 2',
      description: 'Emma Wilson - Offline',
      latitude: 12.9500,
      longitude: 77.6400,
    },
    {
      title: 'Popular Hangout',
      description: 'Coffee Shop',
      latitude: 12.9600,
      longitude: 77.6300,
    },
  ]

  const handleMarkerClick = (marker) => {
    console.log('Clicked:', marker.title)
    // Do something with marker
  }

  return (
    <div className="h-96 rounded-lg overflow-hidden">
      <MapLibreMap
        startLocation={[77.5946, 12.9716]}
        markers={markers}
        onMarkerClick={handleMarkerClick}
        zoom={13}
      />
    </div>
  )
}

// ============================================
// Example 4: Using Map Services
// ============================================
export function MapServicesExample() {
  const [result, setResult] = useState(null)

  const handleGetRoute = async () => {
    const route = await getRoute([77.5946, 12.9716], [77.7099, 13.1939])
    setResult({
      type: 'route',
      data: route,
      message: `${route.distance.toFixed(2)}km in ${route.duration}min`
    })
  }

  const handleGeocode = async () => {
    const location = await geocodeAddress('Vidhana Soudha Bangalore')
    setResult({
      type: 'geocode',
      data: location,
      message: `Lat: ${location.latitude}, Lon: ${location.longitude}`
    })
  }

  const handleReverseGeocode = async () => {
    const address = await reverseGeocode(12.9716, 77.5946)
    setResult({
      type: 'reverse',
      data: address,
      message: address.address
    })
  }

  const handleDistance = () => {
    const dist = haversineDistance([12.9716, 77.5946], [13.1939, 77.7099])
    setResult({
      type: 'distance',
      data: { distance: dist },
      message: `Distance: ${dist.toFixed(2)} km`
    })
  }

  return (
    <div className="space-y-4 p-4">
      <button
        onClick={handleGetRoute}
        className="w-full px-4 py-2 bg-blue-600 rounded font-semibold"
      >
        Get Route
      </button>
      <button
        onClick={handleGeocode}
        className="w-full px-4 py-2 bg-green-600 rounded font-semibold"
      >
        Geocode Address
      </button>
      <button
        onClick={handleReverseGeocode}
        className="w-full px-4 py-2 bg-purple-600 rounded font-semibold"
      >
        Reverse Geocode
      </button>
      <button
        onClick={handleDistance}
        className="w-full px-4 py-2 bg-yellow-600 rounded font-semibold"
      >
        Calculate Distance
      </button>

      {result && (
        <div className="p-4 bg-white/10 rounded">
          <p className="font-semibold text-white">{result.message}</p>
          <pre className="text-xs text-gray-300 mt-2 overflow-auto">
            {JSON.stringify(result.data, null, 2)}
          </pre>
        </div>
      )}
    </div>
  )
}

// ============================================
// Example 5: Offer Ride with Route Display
// ============================================
export function OfferRideMapExample() {
  const [rideInfo, setRideInfo] = useState({
    from: 'Downtown Station',
    to: 'Airport Terminal',
    startCoords: [77.5946, 12.9716],
    endCoords: [77.7099, 13.1939],
    seats: 3,
    price: 300,
  })

  const [routeInfo, setRouteInfo] = useState(null)

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-sm text-gray-400">From</p>
          <p className="text-white font-semibold">{rideInfo.from}</p>
        </div>
        <div>
          <p className="text-sm text-gray-400">To</p>
          <p className="text-white font-semibold">{rideInfo.to}</p>
        </div>
        <div>
          <p className="text-sm text-gray-400">Available Seats</p>
          <p className="text-white font-semibold">{rideInfo.seats}</p>
        </div>
        <div>
          <p className="text-sm text-gray-400">Price per Seat</p>
          <p className="text-white font-semibold">₹{rideInfo.price}</p>
        </div>
      </div>

      <div className="h-96 rounded-lg overflow-hidden">
        <MapLibreMap
          startLocation={rideInfo.startCoords}
          endLocation={rideInfo.endCoords}
          showRoute={true}
          onRouteChange={setRouteInfo}
        />
      </div>

      {routeInfo && (
        <div className="bg-white/10 p-4 rounded">
          <p className="text-sm text-gray-300">
            📍 {routeInfo.distance.toFixed(2)} km • ⏱️ {routeInfo.duration} min
          </p>
        </div>
      )}

      <button className="w-full px-4 py-3 bg-green-600 rounded font-semibold">
        Post Ride
      </button>
    </div>
  )
}

// ============================================
// Example 6: Live Tracking
// ============================================
export function LiveTrackingExample() {
  const [driverLocation, setDriverLocation] = useState([77.5946, 12.9716])
  const [rideDestination] = useState([77.7099, 13.1939])

  useEffect(() => {
    // Simulate driver moving
    const interval = setInterval(() => {
      setDriverLocation(prev => [
        prev[0] + (Math.random() - 0.5) * 0.01,
        prev[1] + (Math.random() - 0.5) * 0.01,
      ])
    }, 2000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-white">Live Tracking</h2>

      <div className="h-96 rounded-lg overflow-hidden">
        <MapLibreMap
          startLocation={driverLocation}
          endLocation={rideDestination}
          showRoute={true}
          zoom={14}
        />
      </div>

      <div className="bg-white/10 p-4 rounded">
        <p className="text-sm text-gray-300">
          🚗 Driver is on the way...
        </p>
        <p className="text-xs text-gray-400 mt-1">
          Lat: {driverLocation[1].toFixed(4)}, Lon: {driverLocation[0].toFixed(4)}
        </p>
      </div>
    </div>
  )
}

// ============================================
// Example 7: Tile Server Switcher
// ============================================
export function TileServerSwitcherExample() {
  const [tileServer, setTileServer] = useState('openStreetMap')

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        {['openStreetMap', 'openTopoMap', 'cartoDB'].map(server => (
          <button
            key={server}
            onClick={() => setTileServer(server)}
            className={`px-3 py-1 rounded font-semibold transition ${
              tileServer === server
                ? 'bg-blue-600 text-white'
                : 'bg-white/10 text-gray-300'
            }`}
          >
            {server === 'openStreetMap' ? 'OSM' : server}
          </button>
        ))}
      </div>

      <div className="h-96 rounded-lg overflow-hidden">
        <MapLibreMap
          startLocation={[77.5946, 12.9716]}
          endLocation={[77.7099, 13.1939]}
          tileServer={tileServer}
          showRoute={true}
        />
      </div>
    </div>
  )
}

export default {
  SimpleRouteExample,
  FindRideWithMapExample,
  MultipleMarkersExample,
  MapServicesExample,
  OfferRideMapExample,
  LiveTrackingExample,
  TileServerSwitcherExample,
}
