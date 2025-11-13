const Ride = require('../models/Ride');
const User = require('../models/User');

// @desc    Create a new ride
// @route   POST /api/rides
// @access  Private
const createRide = async (req, res) => {
    try {
        const { startLocation, endLocation, departureTime, availableSeats, price } = req.body;
        const driver = req.user.id;

        const ride = new Ride({
            driver,
            startLocation,
            endLocation,
            departureTime,
            availableSeats,
            price
        });

        const createdRide = await ride.save();

        // Add ride to user's given rides
        const user = await User.findById(driver);
        user.GivenRides.push(createdRide._id);
        await user.save();

        res.status(201).json(createdRide);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Find available rides
// @route   GET /api/rides
// @access  Public
const findRides = async (req, res) => {
    try {
        const { start, end } = req.query;
        const query = {};
        if (start) {
            query.startLocation = { $regex: start, $options: 'i' };
        }
        if (end) {
            query.endLocation = { $regex: end, $options: 'i' };
        }
        query.departureTime = { $gt: new Date() }; // Only future rides
        query.availableSeats = { $gt: 0 }; // Only rides with available seats

        const rides = await Ride.find(query).populate('driver', 'name Rating');
        res.json(rides);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get a single ride by ID
// @route   GET /api/rides/:id
// @access  Public
const getRideById = async (req, res) => {
    try {
        const ride = await Ride.findById(req.params.id)
            .populate('driver', 'name Rating')
            .populate('passengers.user', 'name'); // Correctly populate the user within the passengers array
        if (ride) {
            res.json(ride);
        } else {
            res.status(404).json({ message: 'Ride not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Join a ride
// @route   POST /api/rides/:id/join
// @access  Private
const joinRide = async (req, res) => {
    try {
        const ride = await Ride.findById(req.params.id);
        const passengerId = req.user.id;
        const { startLocation, endLocation } = req.body;

        if (!startLocation || !endLocation) {
            return res.status(400).json({ message: 'Your start and end locations are required' });
        }

        if (ride) {
            if (ride.driver.toString() === passengerId) {
                return res.status(400).json({ message: 'You cannot join your own ride' });
            }

            // Check if user has already joined
            if (ride.passengers.some(p => p.user.equals(passengerId))) {
                return res.status(400).json({ message: 'You have already joined this ride' });
            }

            if (ride.availableSeats > 0) {
                ride.passengers.push({ user: passengerId, startLocation, endLocation });
                ride.availableSeats--;
                const updatedRide = await ride.save();

                // Add ride to user's taken rides
                const user = await User.findById(passengerId);
                user.TakenRides.push(updatedRide._id);
                await user.save();

                res.json(updatedRide);
            } else {
                res.status(400).json({ message: 'No available seats' });
            }
        } else {
            res.status(404).json({ message: 'Ride not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get user's ride history
// @route   GET /api/rides/history
// @access  Private
const getUserRides = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId).populate('GivenRides').populate('TakenRides');
        if (user) {
            res.json({
                givenRides: user.GivenRides,
                takenRides: user.TakenRides
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


module.exports = {
    createRide,
    findRides,
    getRideById,
    joinRide,
    getUserRides
};
