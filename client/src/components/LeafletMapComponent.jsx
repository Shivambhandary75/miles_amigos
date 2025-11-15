import { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { getRoute } from '../utils/mapService'

// Fix Leaflet default marker icons
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

export default function LeafletMapComponent({
  startLocation = null,
  endLocation = null,
  onRouteChange,
  showRoute = true,
  markers = [],
  onMarkerClick,
  zoom = 13,
}) {
  const mapContainer = useRef(null)
  const map = useRef(null)
  const markersRef = useRef([])
  const routeLayerRef = useRef(null)
  const [routeInfo, setRouteInfo] = useState(null)
  const userMarkerRef = useRef(null)

  // Initialize map
  useEffect(() => {
    if (map.current) return // Map already initialized

    map.current = L.map(mapContainer.current)

    // Add tile layer (OpenStreetMap)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map.current)

    // Add zoom controls
    L.control.zoom({ position: 'bottomright' }).addTo(map.current)

    // Fit world by default (no hardcoded center)
    try {
      map.current.fitWorld()
    } catch (_) {}

    // Try to center on user's current location and add a marker
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords
          const latlng = [latitude, longitude]
          map.current.setView(latlng, zoom)
          // add or update user marker
          if (userMarkerRef.current) {
            userMarkerRef.current.setLatLng(latlng)
          } else {
            userMarkerRef.current = L.marker(latlng, {
              title: 'Your location',
            })
              .bindPopup('<strong>You are here</strong>')
              .addTo(map.current)
          }
        },
        (err) => {
          // If permission denied or error, keep fitWorld without hardcoded fallback
          console.warn('Geolocation unavailable:', err?.message)
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 }
      )
    }

    return () => {
      if (map.current) {
        map.current.remove()
        map.current = null
      }
    }
  }, [])

  // Add route
  useEffect(() => {
    if (!map.current || !showRoute || !startLocation || !endLocation) return

    const fetchRoute = async () => {
      try {
        const route = await getRoute(startLocation, endLocation)
        setRouteInfo(route)

        // Remove existing route layer
        if (routeLayerRef.current) {
          map.current.removeLayer(routeLayerRef.current)
        }

        // Add new route layer using mapService.getRoute shape
        if (route && route.coordinates && route.coordinates.length) {
          const latlngs = route.coordinates.map(coord => [coord[1], coord[0]]) // Swap to lat,lng

          routeLayerRef.current = L.polyline(latlngs, {
            color: '#10b981',
            weight: 4,
            opacity: 0.8,
            dashArray: '5, 5',
          }).addTo(map.current)

          // Fit bounds to route
          const bounds = L.latLngBounds(latlngs)
          map.current.fitBounds(bounds, { padding: [50, 50] })
        }

        if (onRouteChange) {
          onRouteChange(route)
        }
      } catch (error) {
        console.error('Error fetching route:', error)
      }
    }

    fetchRoute()
  }, [startLocation, endLocation, showRoute, onRouteChange])

  // Add start and end location markers
  useEffect(() => {
    if (!map.current) return

    // Clear existing markers
    markersRef.current.forEach(marker => map.current.removeLayer(marker))
    markersRef.current = []

    // Add start marker (green)
    if (startLocation) {
      const startMarker = L.circleMarker(startLocation, {
        radius: 8,
        fillColor: '#22c55e',
        color: '#fff',
        weight: 2,
        opacity: 1,
        fillOpacity: 0.8,
      })
        .bindPopup('<strong>Start Location</strong>')
        .addTo(map.current)

      markersRef.current.push(startMarker)
    }

    // Add end marker (red)
    if (endLocation) {
      const endMarker = L.circleMarker(endLocation, {
        radius: 8,
        fillColor: '#ef4444',
        color: '#fff',
        weight: 2,
        opacity: 1,
        fillOpacity: 0.8,
      })
        .bindPopup('<strong>End Location</strong>')
        .addTo(map.current)

      markersRef.current.push(endMarker)
    }
  }, [startLocation, endLocation])

  // Add custom markers
  useEffect(() => {
    if (!map.current || markers.length === 0) return

    markers.forEach(marker => {
      const leafletMarker = L.marker(marker.location)
        .bindPopup(`<strong>${marker.title}</strong><br/>${marker.description || ''}`)
        .addTo(map.current)

      if (onMarkerClick) {
        leafletMarker.on('click', () => onMarkerClick(marker))
      }

      markersRef.current.push(leafletMarker)
    })
  }, [markers, onMarkerClick])

  return (
    <div
      ref={mapContainer}
      className="w-full h-full rounded-lg"
      style={{ minHeight: '400px' }}
    />
  )
}
