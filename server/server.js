const express = require('express')
const dotenv = require('dotenv')
const connectDB = require('./src/config/db')
const userRoutes = require('./src/routes/userRoutes')
const cors=require('cors')
const http = require('http')
const socketIO = require('socket.io')
dotenv.config()

const app = express()
const server = http.createServer(app)
const io = socketIO(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST']
  }
})

app.use(cors())
app.set('io', io)

// Request logging middleware
app.use((req, res, next) => {
    console.log(`\n[${new Date().toISOString()}] ${req.method} ${req.path}`)
    console.log('Headers:', req.headers.authorization ? 'Token present' : 'No token')
    next()
})

// middlewares
// capture raw body for debugging JSON parse errors
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));


// log raw body when JSON parsing fails
app.use((err, req, res, next) => {
    if (err && err.type === 'entity.parse.failed') {
        console.error('JSON parse error - raw body:\n', req.rawBody)
        return res.status(400).send('Invalid JSON')
    }
    next(err)
})

// routes
app.use('/api/users', userRoutes)


const rideRoutes = require('./src/routes/rideRoutes')
app.use('/api/rides', rideRoutes)

// Geocoding proxy
const geocodeRoutes = require('./src/routes/geocodeRoutes')
app.use('/api/geocode', geocodeRoutes)

// Socket.IO live location tracking
const liveLocations = new Map() // Store live locations: { rideId: { driver: {lat, lng, userId}, passengers: [{lat, lng, userId}] } }

io.on('connection', (socket) => {
  console.log(`\n========================================`)
  console.log(`✅ [SOCKET] Client connected`)
  console.log(`========================================`)
  console.log(`Socket ID: ${socket.id}`)
  console.log(`Time: ${new Date().toLocaleTimeString()}`)
  console.log(`========================================\n`)

  // Join a ride's location room
  socket.on('join-ride', ({ rideId, userId, role }) => {
    const roomName = `ride-${rideId}`
    socket.join(roomName)
    
    console.log(`========================================`)
    console.log(`🚪 [SOCKET] User joined ride room`)
    console.log(`========================================`)
    console.log(`Socket ID: ${socket.id}`)
    console.log(`Ride ID: ${rideId}`)
    console.log(`User ID: ${userId}`)
    console.log(`Role: ${role}`)
    console.log(`Room Name: ${roomName}`)
    console.log(`Time: ${new Date().toLocaleTimeString()}`)
    console.log(`========================================\n`)

    // Initialize location data if not exists
    if (!liveLocations.has(rideId)) {
      liveLocations.set(rideId, { driver: null, passengers: [] })
      console.log(`📍 Created new location storage for ride: ${rideId}\n`)
    }

    // Send current locations to the user
    io.to(socket.id).emit('locations-update', liveLocations.get(rideId))
  })

  // Update user location
  socket.on('location-update', ({ rideId, userId, role, lat, lng }) => {
    const roomName = `ride-${rideId}`
    
    console.log(`========================================`)
    console.log(`📍 [SOCKET] Location update received`)
    console.log(`========================================`)
    console.log(`Socket ID: ${socket.id}`)
    console.log(`Ride ID: ${rideId}`)
    console.log(`User ID: ${userId}`)
    console.log(`Role: ${role}`)
    console.log(`Latitude: ${lat}`)
    console.log(`Longitude: ${lng}`)
    console.log(`Coordinates: [${lng}, ${lat}]`)
    console.log(`Room: ${roomName}`)
    console.log(`Time: ${new Date().toLocaleTimeString()}`)
    
    if (liveLocations.has(rideId)) {
      const rideData = liveLocations.get(rideId)
      
      if (role === 'driver') {
        rideData.driver = { userId, lat, lng }
        console.log(`✅ Updated driver location`)
      } else if (role === 'passenger') {
        const passengerIdx = rideData.passengers.findIndex(p => p.userId === userId)
        if (passengerIdx !== -1) {
          rideData.passengers[passengerIdx] = { userId, lat, lng }
          console.log(`✅ Updated passenger ${passengerIdx + 1} location`)
        } else {
          rideData.passengers.push({ userId, lat, lng })
          console.log(`✅ Added new passenger location (${rideData.passengers.length} total)`)
        }
      }
      
      console.log(`📊 Current ride state:`)
      console.log(`   Driver: ${rideData.driver ? `Present at [${rideData.driver.lng}, ${rideData.driver.lat}]` : 'Not present'}`)
      console.log(`   Passengers: ${rideData.passengers.length}`)
      rideData.passengers.forEach((p, idx) => {
        console.log(`     - Passenger ${idx + 1}: [${p.lng}, ${p.lat}]`)
      })
      console.log(`========================================`)
      console.log(`📤 Broadcasting to room: ${roomName}`)
      console.log(`========================================\n`)
      
      // Broadcast updated locations to all users in this ride
      io.to(roomName).emit('locations-update', rideData)
    } else {
      console.log(`❌ Ride ${rideId} not found in location storage`)
      console.log(`========================================\n`)
    }
  })

  // Leave ride
  socket.on('leave-ride', ({ rideId, userId }) => {
    const roomName = `ride-${rideId}`
    socket.leave(roomName)
    
    console.log(`========================================`)
    console.log(`👋 [SOCKET] User left ride`)
    console.log(`========================================`)
    console.log(`Socket ID: ${socket.id}`)
    console.log(`Ride ID: ${rideId}`)
    console.log(`User ID: ${userId}`)
    console.log(`Room: ${roomName}`)
    console.log(`Time: ${new Date().toLocaleTimeString()}`)

    if (liveLocations.has(rideId)) {
      const rideData = liveLocations.get(rideId)
      rideData.passengers = rideData.passengers.filter(p => p.userId !== userId)
      
      if (!rideData.driver && rideData.passengers.length === 0) {
        liveLocations.delete(rideId)
        console.log(`🧹 Cleaned up location storage for ride: ${rideId}`)
      }
    }
    console.log(`========================================\n`)
  })

  socket.on('disconnect', () => {
    console.log(`========================================`)
    console.log(`❌ [SOCKET] Client disconnected`)
    console.log(`========================================`)
    console.log(`Socket ID: ${socket.id}`)
    console.log(`Time: ${new Date().toLocaleTimeString()}`)
    console.log(`========================================\n`)
  })
})

// connect to DB and start server
const PORT = process.env.PORT || 5000
connectDB().then(() => {
    server.listen(PORT, () => {
        console.log('Server running on port', PORT)
    })
})

