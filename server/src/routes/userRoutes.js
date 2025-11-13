const express = require('express')
const router = express.Router()
const { Register, Login, getProfile, updateUserProfile } = require('../controllers/userController')
const { protect } = require('../middlewares/authMiddleware')

// POST /api/users/register
router.post('/register', Register)

// POST /api/users/login
router.post('/login', Login)

// GET /api/users/profile (protected)
// PUT /api/users/profile (protected)
router.route('/profile')
    .get(protect, getProfile)
    .put(protect, updateUserProfile);

module.exports = router