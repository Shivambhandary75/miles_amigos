const express = require('express');
const   router = express.Router();
const {
    createRide,
    findRides,
    getRideById,
    joinRide,
    getUserRides
} = require('../controllers/rideController');
const { protect } = require('../middlewares/authMiddleware');

// Routes
router.route('/')
    .post(protect, createRide)
    .get(findRides);

router.route('/history')
    .get(protect, getUserRides);

router.route('/:id')
    .get(getRideById);

router.route('/:id/join')
    .post(protect, joinRide);

module.exports = router;
