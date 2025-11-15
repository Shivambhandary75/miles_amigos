import { useEffect, useRef, useState } from 'react'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { getRoute, reverseGeocode, TILE_SERVERS } from '../utils/mapService'

export default function MapLibreMap({ 
  startLocation, 
  endLocation, 
  onRouteChange, 
  tileServer = 'openStreetMap',
  showRoute = true,
  markers = [],
  onMarkerClick,
  zoom = 12,
}) {
  const mapContainer = useRef(null)
  const map = useRef(null)
  const [routeGeoJSON, setRouteGeoJSON] = useState(null)
  const [routeInfo, setRouteInfo] = useState(null)

  // Initialize map
  useEffect(() => {
    if (map.current) return // Map already initialized

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: {
        version: 8,
        sources: {
          osm: {
            type: 'raster',
            tiles: [TILE_SERVERS[tileServer].url],
            tileSize: 256,
            attribution: TILE_SERVERS[tileServer].attribution,
          },
        },
        layers: [
          {
            id: 'osm',
            type: 'raster',
            source: 'osm',
          },
        ],
      },
      center: startLocation || [77.5946, 12.9716], // Default to Bangalore
      zoom: zoom,
    })

    map.current.addControl(new maplibregl.NavigationControl())
    map.current.addControl(new maplibregl.GeolocateControl())

    return () => {
      // Cleanup on unmount
      if (map.current) {
        map.current.remove()
        map.current = null
      }
    }
  }, [tileServer, zoom])

  // Add markers
  useEffect(() => {
    if (!map.current) return

    // Remove existing markers
    const existingMarkers = document.querySelectorAll('.maplibregl-marker')
    existingMarkers.forEach(m => m.remove())

    // Add new markers
    markers.forEach(marker => {
      const el = document.createElement('div')
      el.className = 'w-8 h-8 bg-blue-500 rounded-full border-2 border-white shadow-lg cursor-pointer'
      el.style.backgroundImage = `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/></svg>')`
      el.style.backgroundSize = 'contain'

      const popup = new maplibregl.Popup({ offset: 25 }).setHTML(
        `<div class="text-sm"><strong>${marker.title}</strong><br/>${marker.description || ''}</div>`
      )

      const markObj = new maplibregl.Marker(el)
        .setLngLat([marker.longitude, marker.latitude])
        .setPopup(popup)
        .addTo(map.current)

      if (onMarkerClick) {
        el.addEventListener('click', () => onMarkerClick(marker))
      }
    })
  }, [markers, onMarkerClick])

  // Handle route display
  useEffect(() => {
    if (!map.current || !showRoute || !startLocation || !endLocation) return

    const fetchAndDisplayRoute = async () => {
      const route = await getRoute(startLocation, endLocation)

      if (route) {
        setRouteGeoJSON(route.geometry)
        setRouteInfo({
          distance: route.distance,
          duration: route.duration,
        })

        if (onRouteChange) {
          onRouteChange(route)
        }

        // Add route source
        if (map.current.getSource('route')) {
          map.current.getSource('route').setData(route.geometry)
        } else {
          map.current.addSource('route', {
            type: 'geojson',
            data: route.geometry,
          })

          map.current.addLayer({
            id: 'route',
            type: 'line',
            source: 'route',
            layout: {
              'line-join': 'round',
              'line-cap': 'round',
            },
            paint: {
              'line-color': '#0ea5e9',
              'line-width': 4,
            },
          })
        }

        // Fit bounds to route
        const coordinates = route.coordinates
        const bounds = coordinates.reduce(
          (bounds, coord) => bounds.extend(coord),
          new maplibregl.LngLatBounds(coordinates[0], coordinates[0])
        )

        map.current.fitBounds(bounds, { padding: 50 })
      }
    }

    fetchAndDisplayRoute()
  }, [startLocation, endLocation, showRoute, onRouteChange])

  // Add start and end markers
  useEffect(() => {
    if (!map.current) return

    // Remove existing start/end markers
    const existingMarkers = document.querySelectorAll('[data-marker-type]')
    existingMarkers.forEach(m => m.parentElement?.remove())

    // Add start marker
    if (startLocation) {
      const el = document.createElement('div')
      el.setAttribute('data-marker-type', 'start')
      el.className = 'w-8 h-8 bg-green-500 rounded-full border-2 border-white shadow-lg'

      new maplibregl.Marker(el).setLngLat(startLocation).addTo(map.current)
    }

    // Add end marker
    if (endLocation) {
      const el = document.createElement('div')
      el.setAttribute('data-marker-type', 'end')
      el.className = 'w-8 h-8 bg-red-500 rounded-full border-2 border-white shadow-lg'

      new maplibregl.Marker(el).setLngLat(endLocation).addTo(map.current)
    }
  }, [startLocation, endLocation])

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainer} className="w-full h-full rounded-lg overflow-hidden" />

      {routeInfo && (
        <div className="absolute top-4 right-4 bg-white p-4 rounded-lg shadow-lg backdrop-blur-sm">
          <p className="text-sm font-semibold text-gray-800">Route Info</p>
          <p className="text-xs text-gray-600">
            📍 Distance: {routeInfo.distance.toFixed(2)} km
          </p>
          <p className="text-xs text-gray-600">
            ⏱️ Duration: {routeInfo.duration} min
          </p>
        </div>
      )}
    </div>
  )
}
