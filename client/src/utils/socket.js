import { io } from 'socket.io-client'

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000'

let socket = null

export function initSocket() {
  if (socket) return socket

  socket = io(SOCKET_URL, {
    auth: {
      token: localStorage.getItem('authToken')
    },
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: 5
  })

  socket.on('connect', () => {
    console.log('[Socket] Connected to server')
  })

  socket.on('connect_error', (error) => {
    console.error('[Socket] Connection error:', error)
  })

  socket.on('disconnect', () => {
    console.log('[Socket] Disconnected from server')
  })

  return socket
}

export function getSocket() {
  if (!socket) {
    return initSocket()
  }
  return socket
}

export function joinRide(rideId, userId, role) {
  const s = getSocket()

  console.log('========================================')
  console.log('🚪 [SOCKET] Joining ride room:')
  console.log('========================================')
  console.log(`Ride ID: ${rideId}`)
  console.log(`User ID: ${userId}`)
  console.log(`Role: ${role}`)
  console.log(`Room Name: ride-${rideId}`)
  console.log('Time:', new Date().toLocaleTimeString())
  console.log('========================================\n')

  s.emit('join-ride', { rideId, userId, role })
}

export function updateLocation(rideId, userId, role, lat, lng) {
  const s = getSocket()

  console.log('========================================')
  console.log('📤 [SOCKET] Emitting location-update:')
  console.log('========================================')
  console.log(`Ride ID: ${rideId}`)
  console.log(`User ID: ${userId}`)
  console.log(`Role: ${role}`)
  console.log(`Latitude: ${lat}`)
  console.log(`Longitude: ${lng}`)
  console.log(`Coordinates: [${lng}, ${lat}]`)
  console.log('Time:', new Date().toLocaleTimeString())
  console.log('========================================\n')

  s.emit('location-update', { rideId, userId, role, lat, lng })
}

export function leaveRide(rideId, userId) {
  const s = getSocket()
  s.emit('leave-ride', { rideId, userId })
  console.log(`[Socket] Left ride ${rideId}`)
}

export function onLocationsUpdate(callback) {
  const s = getSocket()
  s.on('locations-update', callback)
}

export function removeLocationsUpdateListener(callback) {
  const s = getSocket()
  s.off('locations-update', callback)
}

export function onLocationMismatchNotification(callback) {
  const s = getSocket()
  s.on('location-mismatch-notification', callback)
}

export function removeLocationMismatchListener(callback) {
  const s = getSocket()
  s.off('location-mismatch-notification', callback)
}

export function closeSocket() {
  if (socket) {
    socket.disconnect()
    socket = null
  }
}
