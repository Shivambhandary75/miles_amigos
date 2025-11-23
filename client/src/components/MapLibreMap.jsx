import { useEffect, useRef, useState } from 'react'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { getRoute, TILE_SERVERS } from '../utils/mapService'

export default function MapLibreMap({
  startLocation,
  endLocation,
  onRouteChange,
  tileServer = 'openStreetMap',
  showRoute = true,
  markers = [],
  onMarkerClick,
  zoom = 12,
  dualPaths = null, // { driver: [...], passenger: [...] }
  liveLocations = null, // { driver: {lat, lng}, passengers: [{lat, lng}] }
  passengerPoints = null, // Array of { pickupCoords, dropCoords, passengerName }
}) {
  const mapContainer = useRef(null)
  const map = useRef(null)

  // Marker refs (store actual MapLibre Marker instances)
  const staticMarkersRef = useRef({ start: null, end: null }) // start/end
  const markerInstancesRef = useRef([]) // generic "markers" from props.markers
  const pickupDropMarkersRef = useRef([]) // pickup/drop per passenger
  const liveMarkersRef = useRef({ driver: null, passengers: [] })

  // Layer/source refs to help re-attach after style changes
  const routeSourceId = useRef('route-source')
  const routeLayerId = useRef('route-layer')
  const driverLayerId = useRef('driver-route-layer')
  const passengerLayerId = useRef('passenger-route-layer')
  const currentTileServerRef = useRef(tileServer)

  // Route info for UI
  const [routeInfo, setRouteInfo] = useState(null)

  // Development logging helper
  const devLog = (...args) => {
    if (process.env.NODE_ENV === 'development') console.log('[MapLibreMap]', ...args)
  }

  // Normalize coordinates to [lng, lat]
  const normalizeCoords = (loc) => {
    // Accept: [lng, lat] or { lat, lng } or { latitude, longitude } or null
    if (!loc) return null
    if (Array.isArray(loc) && loc.length >= 2 && typeof loc[0] === 'number' && typeof loc[1] === 'number') {
      return [loc[0], loc[1]]
    }
    const lng = loc.lng ?? loc.longitude ?? loc[0]
    const lat = loc.lat ?? loc.latitude ?? loc[1]
    if (typeof lng === 'number' && typeof lat === 'number') return [lng, lat]
    return null
  }

  // Build a bare style object for a raster tile server (MapLibre v8)
  const makeStyleForTileServer = (serverKey) => {
    const server = TILE_SERVERS?.[serverKey] ?? TILE_SERVERS?.openStreetMap
    return {
      version: 8,
      sources: {
        osm: {
          type: 'raster',
          tiles: [server.url],
          tileSize: 256,
          attribution: server.attribution || '',
        },
      },
      layers: [
        {
          id: 'osm',
          type: 'raster',
          source: 'osm',
        },
      ],
    }
  }

  // Initialize map (and re-set style on tileServer changes)
  useEffect(() => {
    if (!mapContainer.current) return

    // Create map if doesn't exist
    if (!map.current) {
      devLog('Initializing map with tileServer=', tileServer)
      map.current = new maplibregl.Map({
        container: mapContainer.current,
        style: makeStyleForTileServer(tileServer),
        center: normalizeCoords(startLocation) || [77.5946, 12.9716],
        zoom,
      })

      // Controls
      map.current.addControl(new maplibregl.NavigationControl())
      map.current.addControl(new maplibregl.GeolocateControl({ trackUserLocation: false }))

      // When style is changed (including initial load), re-add persistent layers/markers
      map.current.on('styledata', () => {
        devLog('styledata fired -> reattaching layers & markers')
        // Re-add route (if present)
        if (showRoute && startLocation && endLocation) {
          // re-request route (or reuse last routeInfo if you persisted route geometry elsewhere)
          // We'll call the effect that handles route via dependency hooks
        }

        // Re-attach any markers and layers by calling the specific functions below:
        // Note: other effects below listen to their dependencies and will re-run.
      })
    } else {
      // Map exists and tileServer changed (or prop re-render)
      if (currentTileServerRef.current !== tileServer) {
        devLog('Tile server changed -> setStyle to', tileServer)
        currentTileServerRef.current = tileServer
        try {
          map.current.setStyle(makeStyleForTileServer(tileServer))
        } catch (err) {
          console.error('[MapLibreMap] Error setting style:', err)
        }
      }
    }

    return () => {
      // Cleanup map on unmount
      if (map.current) {
        devLog('Destroying map')
        // remove markers & layers first
        try {
          // remove marker instances
          markerInstancesRef.current.forEach(m => m?.remove?.())
          pickupDropMarkersRef.current.forEach(m => m?.remove?.())
          if (liveMarkersRef.current.driver) liveMarkersRef.current.driver.remove?.()
          liveMarkersRef.current.passengers.forEach(m => m?.remove?.())
        } catch (err) {
          // ignore
        }
        map.current.remove()
        map.current = null
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // run once

  // -------------------------
  // Helper: safe add/remove layer & source
  // -------------------------
  const safeRemoveLayer = (layerId) => {
    if (!map.current) return
    try {
      if (map.current.getLayer(layerId)) map.current.removeLayer(layerId)
    } catch (err) {
      devLog('safeRemoveLayer error', layerId, err)
    }
  }

  const safeRemoveSource = (sourceId) => {
    if (!map.current) return
    try {
      if (map.current.getSource(sourceId)) map.current.removeSource(sourceId)
    } catch (err) {
      devLog('safeRemoveSource error', sourceId, err)
    }
  }

  // -------------------------
  // Static Start/End markers (keeps own namespace)
  // -------------------------
  useEffect(() => {
    if (!map.current) return

    const safeAddStartEnd = () => {
      // Remove old start/end markers (only static ones)
      try {
        if (staticMarkersRef.current.start) {
          staticMarkersRef.current.start.remove()
          staticMarkersRef.current.start = null
        }
        if (staticMarkersRef.current.end) {
          staticMarkersRef.current.end.remove()
          staticMarkersRef.current.end = null
        }
      } catch (err) {
        devLog('Error removing old static markers', err)
      }

      // Add start marker
      const normalizedStart = normalizeCoords(startLocation)
      if (normalizedStart) {
        const el = document.createElement('div')
        el.className = 'w-8 h-8 bg-green-500 rounded-full border-2 border-white shadow-lg'
        el.setAttribute('data-marker-type', 'static-start')

        staticMarkersRef.current.start = new maplibregl.Marker(el).setLngLat(normalizedStart).addTo(map.current)
      }

      // Add end marker
      const normalizedEnd = normalizeCoords(endLocation)
      if (normalizedEnd) {
        const el = document.createElement('div')
        el.className = 'w-8 h-8 bg-red-500 rounded-full border-2 border-white shadow-lg'
        el.setAttribute('data-marker-type', 'static-end')

        staticMarkersRef.current.end = new maplibregl.Marker(el).setLngLat(normalizedEnd).addTo(map.current)
      }
    }

    if (!map.current.isStyleLoaded()) {
      map.current.once('idle', safeAddStartEnd)
    } else {
      safeAddStartEnd()
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startLocation, endLocation]) // only depends on start/end

  // -------------------------
  // Generic markers prop (markers array)
  // -------------------------
  useEffect(() => {
    if (!map.current) return

    const addMarkersFromProp = () => {
      // Remove old markers added from this prop
      markerInstancesRef.current.forEach(m => m?.remove?.())
      markerInstancesRef.current = []

      // Add markers
      markers.forEach((marker) => {
        const lngLat = normalizeCoords([marker.longitude ?? marker.lng, marker.latitude ?? marker.lat])
        if (!lngLat) return

        const el = document.createElement('div')
        el.className = 'w-8 h-8 bg-blue-500 rounded-full border-2 border-white shadow-lg cursor-pointer'
        // You can keep image background or SVG if you prefer:
        el.style.backgroundImage = `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/></svg>')`
        el.style.backgroundSize = 'contain'

        const popup = new maplibregl.Popup({ offset: 25 }).setHTML(
          `<div class="text-sm"><strong>${marker.title ?? ''}</strong><br/>${marker.description ?? ''}</div>`
        )

        const instance = new maplibregl.Marker(el).setLngLat(lngLat).setPopup(popup).addTo(map.current)
        markerInstancesRef.current.push(instance)

        if (onMarkerClick) {
          el.addEventListener('click', () => onMarkerClick(marker))
        }
      })
    }

    if (!map.current.isStyleLoaded()) {
      map.current.once('idle', addMarkersFromProp)
    } else {
      addMarkersFromProp()
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [markers, onMarkerClick])

  // -------------------------
  // Passenger pickup/drop markers (driver view) — robust & namespaced
  // -------------------------
  useEffect(() => {
    devLog('Passenger points effect run, passengerPoints=', passengerPoints)

    if (!map.current) return
    if (!Array.isArray(passengerPoints) || passengerPoints.length === 0) {
      // remove any existing pickup/drop markers if points cleared
      pickupDropMarkersRef.current.forEach(m => m?.remove?.())
      pickupDropMarkersRef.current = []
      return
    }

    const addPickupDropMarkers = () => {
      // Clear old markers
      pickupDropMarkersRef.current.forEach(m => m?.remove?.())
      pickupDropMarkersRef.current = []

      passengerPoints.forEach((point, idx) => {
        try {
          const pickupCoords = normalizeCoords(point.pickupCoords)
          const dropCoords = normalizeCoords(point.dropCoords)

          if (!pickupCoords) {
            console.error(`[MapLibreMap] Invalid pickup coords for passenger ${idx + 1}:`, point.pickupCoords)
          } else {
            const pickupEl = document.createElement('div')
           pickupEl.className = 'w-6 h-6 bg-blue-500 rounded-full border-2 border-white shadow-lg'
            pickupEl.setAttribute('data-marker-type', `pickup-${idx}`)

            const popup = new maplibregl.Popup({ offset: 20 }).setHTML(
              `<div class="text-xs"><strong>🔵 Pickup</strong><br/>${point.passengerName ?? `Passenger ${idx + 1}`}</div>`
            )

            const marker = new maplibregl.Marker(pickupEl).setLngLat(pickupCoords).setPopup(popup).addTo(map.current)
            pickupDropMarkersRef.current.push(marker)
            devLog(`Added pickup marker for passenger ${idx + 1} at`, pickupCoords)
          }

          if (!dropCoords) {
            console.error(`[MapLibreMap] Invalid drop coords for passenger ${idx + 1}:`, point.dropCoords)
          } else {
            const dropEl = document.createElement('div')
         dropEl.className = 'w-6 h-6 bg-yellow-500 rounded-full border-2 border-white shadow-lg'
            dropEl.setAttribute('data-marker-type', `drop-${idx}`)

            const popup = new maplibregl.Popup({ offset: 20 }).setHTML(
              `<div class="text-xs"><strong>🏁 Drop-off</strong><br/>${point.passengerName ?? `Passenger ${idx + 1}`}</div>`
            )

            const marker = new maplibregl.Marker(dropEl).setLngLat(dropCoords).setPopup(popup).addTo(map.current)
            pickupDropMarkersRef.current.push(marker)
            devLog(`Added drop marker for passenger ${idx + 1} at`, dropCoords)
          }
        } catch (err) {
          console.error('[MapLibreMap] Error adding pickup/drop for passenger', idx + 1, err)
        }
      })
    }

    if (!map.current.isStyleLoaded()) {
      map.current.once('idle', addPickupDropMarkers)
    } else {
      addPickupDropMarkers()
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [passengerPoints])

  // -------------------------
  // Live driver & passenger markers (update-only; don't re-create repeatedly)
  // -------------------------
  useEffect(() => {
    if (!map.current) return
    if (!liveLocations) {
      // remove live markers if needed
      try {
        if (liveMarkersRef.current.driver) {
          liveMarkersRef.current.driver.remove()
          liveMarkersRef.current.driver = null
        }
        liveMarkersRef.current.passengers.forEach(m => m?.remove?.())
        liveMarkersRef.current.passengers = []
      } catch (err) {
        devLog('Error clearing live markers', err)
      }
      return
    }

    const updateLiveMarkers = () => {
      // Driver
      if (liveLocations.driver && typeof liveLocations.driver.lat === 'number' && typeof liveLocations.driver.lng === 'number') {
        const coords = [liveLocations.driver.lng, liveLocations.driver.lat]
        if (liveMarkersRef.current.driver) {
          // just update position
          liveMarkersRef.current.driver.setLngLat(coords)
        } else {
          const el = document.createElement('div')
          el.className = 'w-6 h-6 bg-blue-500 rounded-full border-2 border-white shadow-lg animate-pulse'
          el.setAttribute('data-live-marker', 'driver')
          const popup = new maplibregl.Popup({ offset: 20 }).setHTML('<div class="text-xs"><strong>Driver Location</strong></div>')
          liveMarkersRef.current.driver = new maplibregl.Marker(el).setLngLat(coords).setPopup(popup).addTo(map.current)
        }
      } else {
        // remove driver marker if no valid driver location
        if (liveMarkersRef.current.driver) {
          liveMarkersRef.current.driver.remove()
          liveMarkersRef.current.driver = null
        }
      }

      // Passengers
      // Remove old passenger live markers
      liveMarkersRef.current.passengers.forEach(m => m?.remove?.())
      liveMarkersRef.current.passengers = []

      if (Array.isArray(liveLocations.passengers)) {
        liveLocations.passengers.forEach((p, idx) => {
          if (typeof p.lat !== 'number' || typeof p.lng !== 'number') return
          const coords = [p.lng, p.lat]
          const el = document.createElement('div')
          el.className = 'w-5 h-5 bg-green-500 rounded-full border-2 border-white shadow-lg'
          el.setAttribute('data-live-marker', `passenger-${idx}`)
          const popup = new maplibregl.Popup({ offset: 20 }).setHTML('<div class="text-xs"><strong>Passenger Location</strong></div>')
          const marker = new maplibregl.Marker(el).setLngLat(coords).setPopup(popup).addTo(map.current)
          liveMarkersRef.current.passengers.push(marker)
        })
      }
    }

    if (!map.current.isStyleLoaded()) {
      map.current.once('idle', updateLiveMarkers)
    } else {
      updateLiveMarkers()
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [liveLocations])

  // -------------------------
  // Dual paths (driver & passenger) as separate layers
  // -------------------------
  useEffect(() => {
    if (!map.current) return
    // Remove old layers/sources if any
    const addDualPathLayers = () => {
      // Driver route
      try {
        safeRemoveLayer(driverLayerId.current)
        safeRemoveSource('driver-route-source')
        if (dualPaths?.driver && Array.isArray(dualPaths.driver) && dualPaths.driver.length > 0) {
          const driverGeoJSON = {
            type: 'Feature',
            geometry: { type: 'LineString', coordinates: dualPaths.driver },
          }
          map.current.addSource('driver-route-source', { type: 'geojson', data: driverGeoJSON })
          map.current.addLayer({
            id: driverLayerId.current,
            type: 'line',
            source: 'driver-route-source',
            layout: { 'line-join': 'round', 'line-cap': 'round' },
            paint: { 'line-color': '#3b82f6', 'line-width': 5 },
          })
        }
      } catch (err) {
        console.error('[MapLibreMap] driver dual path error', err)
      }

      // Passenger route
      try {
        safeRemoveLayer(passengerLayerId.current)
        safeRemoveSource('passenger-route-source')
        if (dualPaths?.passenger && Array.isArray(dualPaths.passenger) && dualPaths.passenger.length > 0) {
          const passengerGeoJSON = {
            type: 'Feature',
            geometry: { type: 'LineString', coordinates: dualPaths.passenger },
          }
          map.current.addSource('passenger-route-source', { type: 'geojson', data: passengerGeoJSON })
          map.current.addLayer({
            id: passengerLayerId.current,
            type: 'line',
            source: 'passenger-route-source',
            layout: { 'line-join': 'round', 'line-cap': 'round' },
            paint: { 'line-color': '#10b981', 'line-width': 4, 'line-dasharray': [4, 4] },
          })
        }
      } catch (err) {
        console.error('[MapLibreMap] passenger dual path error', err)
      }
    }

    if (!map.current.isStyleLoaded()) {
      map.current.once('idle', addDualPathLayers)
    } else {
      addDualPathLayers()
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dualPaths])

  // -------------------------
  // Route (start -> end) rendering + onRouteChange callback
  // -------------------------
  useEffect(() => {
    if (!map.current) return
    if (!showRoute) {
      // remove route if present
      safeRemoveLayer(routeLayerId.current)
      safeRemoveSource(routeSourceId.current)
      setRouteInfo(null)
      return
    }
    const normalizedStart = normalizeCoords(startLocation)
    const normalizedEnd = normalizeCoords(endLocation)
    if (!normalizedStart || !normalizedEnd) return

    let didCancel = false

    const fetchAndDrawRoute = async () => {
      try {
        const route = await getRoute(normalizedStart, normalizedEnd)
        if (didCancel) return
        if (!route || !route.geometry) {
          devLog('No route returned')
          return
        }

        // route.geometry expected to be a GeoJSON Feature or geometry; adapt
        const geometry = route.geometry.type === 'Feature' ? route.geometry.geometry : route.geometry
        const data = {
          type: 'Feature',
          geometry,
        }

        const addRoute = () => {
          // Remove existing
          safeRemoveLayer(routeLayerId.current)
          safeRemoveSource(routeSourceId.current)

          // Add source
          try {
            map.current.addSource(routeSourceId.current, { type: 'geojson', data })
            map.current.addLayer({
              id: routeLayerId.current,
              type: 'line',
              source: routeSourceId.current,
              layout: { 'line-join': 'round', 'line-cap': 'round' },
              paint: { 'line-color': '#0ea5e9', 'line-width': 4 },
            })

            // Fit to bounds (if coordinates available)
            const coords = geometry.coordinates || []
            if (coords.length > 0) {
              const bounds = coords.reduce(
                (b, c) => b.extend(c),
                new maplibregl.LngLatBounds(coords[0], coords[0])
              )
              map.current.fitBounds(bounds, { padding: 50 })
            }
          } catch (err) {
            console.error('[MapLibreMap] Error adding route layer', err)
          }
        }

        if (!map.current.isStyleLoaded()) {
          map.current.once('idle', addRoute)
        } else {
          addRoute()
        }

        // Save route info for UI & callback
        setRouteInfo({ distance: route.distance ?? 0, duration: route.duration ?? 0 })
        if (onRouteChange) {
          onRouteChange({ distance: route.distance ?? 0, duration: route.duration ?? 0 })
        }
      } catch (err) {
        console.error('[MapLibreMap] Error fetching route', err)
      }
    }

    fetchAndDrawRoute()

    return () => {
      didCancel = true
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startLocation, endLocation, showRoute])

  // -------------------------
  // Small safety: if end/start change often, we keep routeInfo updated separately
  // -------------------------
  useEffect(() => {
    // if routeInfo changes externally, it is already handled by the route effect above
    // No-op here except providing a stable UI
  }, [routeInfo])

  // -------------------------
  // Render
  // -------------------------
  return (
    <div className="relative w-full h-full">
      <div ref={mapContainer} className="w-full h-full rounded-lg overflow-hidden" />

      {routeInfo && (
        <div className="absolute top-4 right-4 bg-white p-4 rounded-lg shadow-lg backdrop-blur-sm">
          <p className="text-sm font-semibold text-gray-800">Route Info</p>
          <p className="text-xs text-gray-600">📍 Distance: {Number(routeInfo.distance || 0).toFixed(2)} km</p>
          <p className="text-xs text-gray-600">⏱️ Duration: {Number(routeInfo.duration || 0)} min</p>
        </div>
      )}
    </div>
  )
}
