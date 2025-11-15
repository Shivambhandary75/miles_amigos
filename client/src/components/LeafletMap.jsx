import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { getRoute, TILE_SERVERS } from '../utils/mapService'

// Fix for default markers
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

export default function LeafletMap({
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
  const markersRef = useRef([])
  const routeLayerRef = useRef(null)

  // Initialize map
  useEffect(() => {
    if (map.current) return

    const tileConfig = TILE_SERVERS[tileServer]
    map.current = L.map(mapContainer.current).setView(
      startLocation || [12.9716, 77.5946], // Bangalore coords [lat, lon]
      zoom
    )

    L.tileLayer(tileConfig.url, {
      attribution: tileConfig.attribution,
      maxZoom: tileConfig.maxZoom,
    }).addTo(map.current)

    return () => {
      if (map.current) {
        map.current.remove()
        map.current = null
      }
    }
  }, [tileServer, zoom])

  // Add custom markers
  useEffect(() => {
    if (!map.current) return

    // Clear existing markers
    markersRef.current.forEach(m => m.remove())
    markersRef.current = []

    // Add new markers
    markers.forEach(marker => {
      const markerObj = L.marker([marker.latitude, marker.longitude], {
        title: marker.title,
      })
        .bindPopup(`<strong>${marker.title}</strong><br/>${marker.description || ''}`)
        .addTo(map.current)

      if (onMarkerClick) {
        markerObj.on('click', () => onMarkerClick(marker))
      }

      markersRef.current.push(markerObj)
    })
  }, [markers, onMarkerClick])

  // Display route
  useEffect(() => {
    if (!map.current || !showRoute || !startLocation || !endLocation) return

    const fetchAndDisplayRoute = async () => {
      const route = await getRoute(startLocation, endLocation)

      if (route) {
        if (onRouteChange) {
          onRouteChange(route)
        }

        // Convert GeoJSON coordinates to Leaflet format [lat, lon]
        const coordinates = route.coordinates.map(([lon, lat]) => [lat, lon])

        // Remove existing route layer
        if (routeLayerRef.current) {
          map.current.removeLayer(routeLayerRef.current)
        }

        // Add new route
        routeLayerRef.current = L.polyline(coordinates, {
          color: '#0ea5e9',
          weight: 4,
          opacity: 0.8,
          lineCap: 'round',
          lineJoin: 'round',
        }).addTo(map.current)

        // Fit bounds
        const bounds = L.latLngBounds(coordinates)
        map.current.fitBounds(bounds, { padding: [50, 50] })
      }
    }

    fetchAndDisplayRoute()
  }, [startLocation, endLocation, showRoute, onRouteChange])

  // Add start and end markers
  useEffect(() => {
    if (!map.current) return

    // Remove existing start/end markers
    markersRef.current.forEach(m => {
      if (m.options.title === 'Start' || m.options.title === 'End') {
        m.remove()
      }
    })

    markersRef.current = markersRef.current.filter(
      m => m.options.title !== 'Start' && m.options.title !== 'End'
    )

    // Add start marker
    if (startLocation) {
      const startMarker = L.marker([startLocation[1], startLocation[0]], {
        title: 'Start',
        icon: L.icon({
          iconUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="green"><circle cx="12" cy="12" r="10"/></svg>',
          iconSize: [32, 32],
        }),
      })
        .bindPopup('Start Location')
        .addTo(map.current)

      markersRef.current.push(startMarker)
    }

    // Add end marker
    if (endLocation) {
      const endMarker = L.marker([endLocation[1], endLocation[0]], {
        title: 'End',
        icon: L.icon({
          iconUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="red"><circle cx="12" cy="12" r="10"/></svg>',
          iconSize: [32, 32],
        }),
      })
        .bindPopup('End Location')
        .addTo(map.current)

      markersRef.current.push(endMarker)
    }
  }, [startLocation, endLocation])

  return (
    <div ref={mapContainer} className="w-full h-full rounded-lg overflow-hidden" />
  )
}
