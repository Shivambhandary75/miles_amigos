const express = require('express')
const router = express.Router()
const { Register, Login, getProfile, updateUserProfile, getNotifications, getUserStats, confirmRideCompletion, addFriend, getFriends, deleteFriend } = require('../controllers/userController')
const { protect } = require('../middlewares/authMiddleware')

// POST /api/users/register
router.post('/register', Register)

// POST /api/users/login
router.post('/login', Login)

// GET /api/users/me (protected) - Get current user ID
router.get('/me', protect, (req, res) => {
    res.json({ _id: req.user.id, email: req.user.email, name: req.user.name })
})

// GET /api/users/profile (protected)
// PUT /api/users/profile (protected)
router.route('/profile')
    .get(protect, getProfile)
    .put(protect, updateUserProfile);

// GET /api/users/notifications (protected)
router.get('/notifications', protect, getNotifications);

// GET /api/users/stats (protected)
router.get('/stats', protect, getUserStats);

// POST /api/users/rides/:id/confirm-completion (protected)
router.post('/rides/:id/confirm-completion', protect, confirmRideCompletion);

// POST /api/users/add-friend (protected)
router.post('/add-friend', protect, addFriend);

// GET /api/users/friends (protected)
router.get('/friends', protect, getFriends);

// DELETE /api/users/friends/:friendId (protected)
router.delete('/friends/:friendId', protect, deleteFriend);

module.exports = router