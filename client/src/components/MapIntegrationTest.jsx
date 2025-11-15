import { useState, useEffect } from 'react'
import MapLibreMap from './MapLibreMap'
import { getRoute, geocodeAddress, reverseGeocode } from '../utils/mapService'

export default function MapIntegrationTest() {
  const [testStep, setTestStep] = useState(1)
  const [routeData, setRouteData] = useState(null)
  const [geocodeResult, setGeocodeResult] = useState(null)
  const [reverseResult, setReverseResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Test coordinates
  const BANGALORE_CENTER = [77.5946, 12.9716]
  const BANGALORE_AIRPORT = [77.7099, 13.1939]

  // Step 1: Test OSRM - Get Route
  const testOSRMRoute = async () => {
    setLoading(true)
    setError(null)
    try {
      console.log('📍 Testing OSRM Route Calculation...')
      console.log('Start:', BANGALORE_CENTER, 'End:', BANGALORE_AIRPORT)
      
      const route = await getRoute(BANGALORE_CENTER, BANGALORE_AIRPORT)
      console.log('✅ OSRM Route Response:', route)
      
      setRouteData(route)
      setTestStep(2)
    } catch (err) {
      console.error('❌ OSRM Error:', err)
      setError(`OSRM Error: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  // Step 2: Test Nominatim - Geocode Address
  const testGeocoding = async () => {
    setLoading(true)
    setError(null)
    try {
      console.log('🌍 Testing Address Geocoding...')
      
      const result = await geocodeAddress('Vidhana Soudha Bangalore')
      console.log('✅ Geocode Response:', result)
      
      setGeocodeResult(result)
      setTestStep(3)
    } catch (err) {
      console.error('❌ Geocoding Error:', err)
      setError(`Geocoding Error: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  // Step 3: Test Nominatim - Reverse Geocode
  const testReverseGeocoding = async () => {
    setLoading(true)
    setError(null)
    try {
      console.log('📍 Testing Reverse Geocoding...')
      console.log('Coordinates:', BANGALORE_CENTER)
      
      const result = await reverseGeocode(BANGALORE_CENTER[1], BANGALORE_CENTER[0])
      console.log('✅ Reverse Geocode Response:', result)
      
      setReverseResult(result)
      setTestStep(4)
    } catch (err) {
      console.error('❌ Reverse Geocoding Error:', err)
      setError(`Reverse Geocoding Error: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-2">🗺️ Maps Integration Test</h1>
        <p className="text-gray-400 mb-6">Testing MapLibre GL + OSRM + Nominatim Integration</p>

        {error && (
          <div className="bg-red-900/50 border border-red-500 p-4 rounded mb-6">
            <p className="font-semibold">⚠️ Error:</p>
            <p>{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Tests */}
          <div className="lg:col-span-1 space-y-4">
            {/* Test 1: OSRM Route */}
            <div className={`p-4 rounded border-2 transition ${
              testStep >= 1 
                ? 'border-blue-500 bg-blue-900/20' 
                : 'border-gray-600 bg-gray-800/20'
            }`}>
              <h2 className="font-bold mb-2 flex items-center gap-2">
                <span className={testStep >= 1 ? '✅' : '⏳'}>
                  {testStep >= 1 ? '✅' : '1️⃣'}
                </span>
                OSRM Route Test
              </h2>
              <p className="text-sm text-gray-300 mb-3">
                Get route from Downtown to Airport using OSRM
              </p>
              <button
                onClick={testOSRMRoute}
                disabled={loading}
                className={`w-full px-4 py-2 rounded font-semibold transition ${
                  loading
                    ? 'bg-gray-600 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {loading ? '⏳ Testing...' : '▶️ Run Test 1'}
              </button>
              {routeData && (
                <div className="mt-3 text-sm bg-black/30 p-2 rounded">
                  <p>📏 Distance: <span className="text-green-400">{routeData.distance.toFixed(2)} km</span></p>
                  <p>⏱️ Duration: <span className="text-green-400">{routeData.duration} min</span></p>
                </div>
              )}
            </div>

            {/* Test 2: Geocoding */}
            <div className={`p-4 rounded border-2 transition ${
              testStep >= 2 
                ? 'border-green-500 bg-green-900/20' 
                : 'border-gray-600 bg-gray-800/20'
            }`}>
              <h2 className="font-bold mb-2 flex items-center gap-2">
                <span>{testStep >= 2 ? '✅' : '2️⃣'}</span>
                Geocoding Test
              </h2>
              <p className="text-sm text-gray-300 mb-3">
                Convert address to coordinates using Nominatim
              </p>
              <button
                onClick={testGeocoding}
                disabled={loading}
                className={`w-full px-4 py-2 rounded font-semibold transition ${
                  loading
                    ? 'bg-gray-600 cursor-not-allowed'
                    : 'bg-green-600 hover:bg-green-700'
                }`}
              >
                {loading ? '⏳ Testing...' : '▶️ Run Test 2'}
              </button>
              {geocodeResult && (
                <div className="mt-3 text-sm bg-black/30 p-2 rounded">
                  <p>📍 Address: <span className="text-green-400 text-xs">{geocodeResult.address}</span></p>
                  <p>Lat: <span className="text-green-400">{geocodeResult.latitude.toFixed(4)}</span></p>
                  <p>Lon: <span className="text-green-400">{geocodeResult.longitude.toFixed(4)}</span></p>
                </div>
              )}
            </div>

            {/* Test 3: Reverse Geocoding */}
            <div className={`p-4 rounded border-2 transition ${
              testStep >= 3 
                ? 'border-purple-500 bg-purple-900/20' 
                : 'border-gray-600 bg-gray-800/20'
            }`}>
              <h2 className="font-bold mb-2 flex items-center gap-2">
                <span>{testStep >= 3 ? '✅' : '3️⃣'}</span>
                Reverse Geocoding Test
              </h2>
              <p className="text-sm text-gray-300 mb-3">
                Convert coordinates to address
              </p>
              <button
                onClick={testReverseGeocoding}
                disabled={loading}
                className={`w-full px-4 py-2 rounded font-semibold transition ${
                  loading
                    ? 'bg-gray-600 cursor-not-allowed'
                    : 'bg-purple-600 hover:bg-purple-700'
                }`}
              >
                {loading ? '⏳ Testing...' : '▶️ Run Test 3'}
              </button>
              {reverseResult && (
                <div className="mt-3 text-sm bg-black/30 p-2 rounded">
                  <p>📍 Address: <span className="text-green-400 text-xs">{reverseResult.address}</span></p>
                </div>
              )}
            </div>

            {/* Test 4: MapLibre */}
            <div className={`p-4 rounded border-2 transition ${
              testStep >= 4 
                ? 'border-yellow-500 bg-yellow-900/20' 
                : 'border-gray-600 bg-gray-800/20'
            }`}>
              <h2 className="font-bold mb-2 flex items-center gap-2">
                <span>4️⃣</span>
                MapLibre Visualization
              </h2>
              <p className="text-sm text-gray-300">
                See route on map →
              </p>
            </div>
          </div>

          {/* Right Column: Map Display */}
          <div className="lg:col-span-2">
            {testStep >= 4 && routeData ? (
              <div className="space-y-4">
                <div className="bg-gray-800/50 p-4 rounded border border-gray-700">
                  <h3 className="font-bold mb-2">📍 Route Information</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-400">Start</p>
                      <p className="font-mono text-green-400">[{BANGALORE_CENTER[0]}, {BANGALORE_CENTER[1]}]</p>
                    </div>
                    <div>
                      <p className="text-gray-400">End</p>
                      <p className="font-mono text-green-400">[{BANGALORE_AIRPORT[0]}, {BANGALORE_AIRPORT[1]}]</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Distance</p>
                      <p className="font-mono text-blue-400">{routeData.distance.toFixed(2)} km</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Duration</p>
                      <p className="font-mono text-blue-400">{routeData.duration} min</p>
                    </div>
                  </div>
                </div>

                <div className="h-96 rounded-lg overflow-hidden border border-gray-700 shadow-lg">
                  <MapLibreMap
                    startLocation={BANGALORE_CENTER}
                    endLocation={BANGALORE_AIRPORT}
                    showRoute={true}
                    zoom={12}
                  />
                </div>

                <div className="bg-gray-800/50 p-4 rounded border border-gray-700">
                  <h3 className="font-bold mb-2">✅ Integration Status</h3>
                  <div className="space-y-2 text-sm">
                    <p>✅ MapLibre GL - Rendering map with WebGL</p>
                    <p>✅ OSRM - Calculating route ({routeData.distance.toFixed(2)}km)</p>
                    <p>✅ Nominatim - Available for geocoding</p>
                    <p className="text-yellow-400 mt-3">
                      🎉 All integrations working!
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center bg-gray-800/50 rounded-lg border-2 border-dashed border-gray-600">
                <div className="text-center">
                  <p className="text-2xl mb-2">🗺️</p>
                  <p className="text-gray-400">Run the tests to see the map visualization</p>
                  <p className="text-sm text-gray-500 mt-2">Tests will show OSRM routing + MapLibre rendering</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Console Output */}
        <div className="mt-8 bg-black/50 p-4 rounded border border-gray-700">
          <p className="font-bold mb-2">💻 Console Tips:</p>
          <ul className="text-sm text-gray-300 space-y-1">
            <li>🔍 Open DevTools (F12) → Console tab to see API calls</li>
            <li>📊 Watch OSRM requests: `https://router.project-osrm.org`</li>
            <li>🌐 Watch Nominatim requests: `https://nominatim.openstreetmap.org`</li>
            <li>✅ All requests should return 200 status</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
