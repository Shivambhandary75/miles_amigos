const express = require('express');
const router = express.Router();
const {
    createRide,
    findRides,
    getRideById,
    joinRide,
    getUserRides,
    getRideHistory,
    confirmPaymentAndEndRide,
    passengerConfirmRideCompletion,
    getDriverInProgressRide,
    getDriverRideRequests,
    acceptRideRequest,
    rejectRideRequest,
    startRide,
    rateRide
} = require('../controllers/rideController');
const { searchRides } = require("../controllers/rideSearchController");
const { protect } = require('../middlewares/authMiddleware');

// Routes - Specific routes MUST come before dynamic parameter routes
router.route('/')
    .post(protect, createRide)
    .get(findRides);

// Specific GET routes (before /:id)
router.route('/in-progress')
    .get(protect, getDriverInProgressRide);

router.route('/requests')
    .get(protect, getDriverRideRequests);

router.route('/history')
    .get(protect, getRideHistory);

router.post("/search", protect, searchRides);

// Dynamic parameter routes (after specific routes)
router.route('/:id')
    .get(getRideById);

router.route('/:id/join')
    .post(protect, joinRide);

router.route('/:id/start')
    .post(protect, startRide);

router.route('/:id/confirm-payment')
    .post(protect, confirmPaymentAndEndRide);

router.route('/:id/passenger-confirm-completion')
    .post(protect, passengerConfirmRideCompletion);

router.route('/:id/rate')
    .post(protect, rateRide);

router.route('/:id/rate-passenger/:passengerId')
    .post(protect, require('../controllers/rideController').ratePassenger);

router.route('/:rideId/requests/:passengerId/accept')
    .put(protect, acceptRideRequest);

router.route('/:rideId/requests/:passengerId/reject')
    .put(protect, rejectRideRequest);

module.exports = router;
