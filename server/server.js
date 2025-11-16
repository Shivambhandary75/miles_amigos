const express = require('express')
const dotenv = require('dotenv')
const connectDB = require('./src/config/db')
const userRoutes = require('./src/routes/userRoutes')
const cors=require('cors')
dotenv.config()

const app = express()
app.use(cors())
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

// connect to DB and start server
const PORT = process.env.PORT || 5000
connectDB().then(() => {
    app.listen(PORT, () => {
        console.log('Server running on port', PORT)
    })
})

