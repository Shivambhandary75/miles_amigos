const express = require('express')
const router = express.Router()
const { Register, Login, getProfile } = require('../controllers/userController')
const { protect } = require('../middlewares/authMiddleware')

// POST /api/users/register
router.post('/register', Register)

// POST /api/users/login
router.post('/login', Login)

// GET /api/users/me (protected)
router.get('/me', protect, getProfile)

module.exports = router
