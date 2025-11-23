const Ride = require('../models/Ride');
const User = require('../models/User');
const { haversineDistance } = require('../utils/mapRouting');

// @desc    Create a new ride
// @route   POST /api/rides
// @access  Private
const createRide = async (req, res) => {
    try {
        const {
            startLocation,
            endLocation,
            departureTime,
            availableSeats,
            price,
            notes,
            routePolyline,
            routeGeoJSON
        } = req.body;

        const driver = req.user.id;

        // Validate required fields
        if (!startLocation || !endLocation || !routePolyline || !routeGeoJSON) {
            return res.status(400).json({ message: "Missing route data" });
        }

        const ride = new Ride({
            driver,
            startLocation,
            endLocation,
            departureTime,
            availableSeats,
            price,
            notes,
            routePolyline,
            routeGeoJSON
        });

        const createdRide = await ride.save();

        // Add ride to driver's GivenRides
        const user = await User.findById(driver);
        user.GivenRides.push(createdRide._id);
        await user.save();

        res.status(201).json(createdRide);

    } catch (error) {
        console.error(error);
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
        
        // Include rides that are scheduled for the future or are currently in-progress
        query.$or = [
            { departureTime: { $gt: new Date() }, status: 'scheduled' },
            { status: 'in-progress' }
        ];
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
        const rideId = req.params.id;
        
        // Validate ride ID
        if (!rideId) {
            return res.status(400).json({ message: 'Ride ID is required' });
        }
        
        const ride = await Ride.findById(rideId);
        const passengerId = req.user.id;
        const { startLocation, endLocation } = req.body;

        console.log('joinRide request:', { rideId, passengerId, startLocation, endLocation });

        // Validate location objects have required fields
        if (!startLocation || !startLocation.name || startLocation.lat === undefined || startLocation.lng === undefined) {
            console.error('Invalid startLocation:', startLocation);
            return res.status(400).json({ message: 'startLocation must have name, lat, and lng' });
        }

        if (!endLocation || !endLocation.name || endLocation.lat === undefined || endLocation.lng === undefined) {
            console.error('Invalid endLocation:', endLocation);
            return res.status(400).json({ message: 'endLocation must have name, lat, and lng' });
        }

        if (!ride) {
            console.error('Ride not found:', rideId);
            return res.status(404).json({ message: 'Ride not found' });
        }

        console.log('Ride found, checking conditions:', { 
            driverId: ride.driver.toString(),
            passengerId,
            availableSeats: ride.availableSeats,
            alreadyJoined: ride.passengers.some(p => p.user.equals(passengerId))
        });

        if (ride) {
            const driverIdStr = ride.driver.toString();
            const passengerIdStr = passengerId.toString ? passengerId.toString() : passengerId;
            console.log('Comparing IDs:', { driverIdStr, passengerIdStr, equal: driverIdStr === passengerIdStr });
            if (driverIdStr === passengerIdStr) {
                console.log('ERROR: User trying to join own ride');
                return res.status(400).json({ message: 'You cannot join your own ride' });
            }

            // Check if user has already joined
            const alreadyJoined = ride.passengers.some(p => p.user.equals(passengerId));
            console.log('Already joined check:', { alreadyJoined, passengerCount: ride.passengers.length });
            if (alreadyJoined) {
                console.log('ERROR: User already joined this ride');
                return res.status(400).json({ message: 'You have already joined this ride' });
            }

            console.log('Checking available seats:', { availableSeats: ride.availableSeats });

            if (ride.availableSeats > 0) {
                console.log('Seats available, proceeding with booking');
                try {
                    ride.passengers.push({ user: passengerId, startLocation, endLocation, status: 'pending' }); // Set status to pending
                    // Do NOT decrement availableSeats here. Decrement only upon acceptance.
                    console.log('About to save ride with passengers:', { passengers: ride.passengers, availableSeats: ride.availableSeats });
                    const updatedRide = await ride.save();
                    console.log('Ride saved successfully');

                    // Add ride to user's taken rides
                    const user = await User.findById(passengerId);
                    user.TakenRides.push(updatedRide._id);
                    await user.save();
                    console.log('User updated successfully');

                    // Add notification to ride driver
                    const driverUser = await User.findById(ride.driver);
                    if (driverUser) {
                        // Safely get location names
                        const startLocationName = ride.startLocation?.name || startLocation?.name || 'Unknown location';
                        const endLocationName = ride.endLocation?.name || endLocation?.name || 'Unknown location';
                        
                        // Notification details
                        driverUser.notifications = driverUser.notifications || [];
                        driverUser.notifications.push({
                            icon: 'friends',
                            title: 'New Ride Request',
                            desc: `${user.name} wants to join your ride from ${startLocationName} to ${endLocationName}`,
                            time: new Date().toLocaleString(),
                            type: 'ride-request',
                            rideId: ride._id,
                            passengerId: user._id,
                            createdAt: new Date()
                        });
                        await driverUser.save();
                        console.log('Driver notified successfully');
                    }

                    console.log('Ride successfully updated, returning:', updatedRide);
                    res.json(updatedRide);
                } catch (saveError) {
                    console.error('Error during save operations:', saveError);
                    throw saveError;
                }
            } else {
                console.log('ERROR: No available seats in this ride');
                res.status(400).json({ message: 'No available seats' });
            }
        } else {
            res.status(404).json({ message: 'Ride not found' });
        }
    } catch (error) {
        console.error('Error in joinRide:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get user's ride history
// @route   GET /api/rides/history
// @access  Private
const getUserRides = async (req, res) => {
    try {
        const userId = req.user.id;
        console.log(`[getUserRides] Fetching rides for user: ${userId}`)
        
        const user = await User.findById(userId)
            .populate({ path: 'GivenRides', populate: { path: 'driver', select: 'name Rating' }, select: 'status startLocation endLocation departureTime availableSeats price passengers' })
            .populate({ path: 'TakenRides', populate: { path: 'driver', select: 'name Rating' }, select: 'status startLocation endLocation departureTime availableSeats price passengers' });
        
        console.log(`[getUserRides] User found: ${user ? 'Yes' : 'No'}`)
        if (user) {
            console.log(`[getUserRides] GivenRides count: ${user.GivenRides.length}`)
            console.log(`[getUserRides] TakenRides count: ${user.TakenRides.length}`)
            
            // Log detailed ride info
            user.GivenRides.forEach((ride, idx) => {
                console.log(`[getUserRides] Given Ride ${idx}: id=${ride._id}, status=${ride.status}, passengers=${ride.passengers.length}`)
                ride.passengers.forEach(p => {
                    console.log(`  - Passenger: ${p.user}, status: ${p.status}`)
                })
            })
            
            user.TakenRides.forEach((ride, idx) => {
                console.log(`[getUserRides] Taken Ride ${idx}: id=${ride._id}, status=${ride.status}, passengers=${ride.passengers.length}`)
                ride.passengers.forEach(p => {
                    console.log(`  - Passenger: ${p.user}, status: ${p.status}`)
                })
            })
            
            // Format rides for frontend
            const formatRide = (ride, role) => ({
                id: ride._id,
                from: ride.startLocation,
                to: ride.endLocation,
                date: ride.departureTime ? new Date(ride.departureTime).toLocaleDateString() : '',
                time: ride.departureTime ? new Date(ride.departureTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '',
                driver: ride.driver?.name || 'Unknown',
                rating: ride.driver?.Rating || 0,
                seats: ride.availableSeats,
                fare: ride.price ? `₹${ride.price}` : '',
                status: ride.status,
                role,
                passengers: ride.passengers // Include passengers for detailed view
            });
            
            // Only include scheduled and in-progress rides (exclude completed) AND must have at least one accepted passenger
            const givenRides = user.GivenRides
              .filter(r => {
                const hasAcceptedPassenger = r.passengers && r.passengers.some(p => p.status === 'accepted')
                const isActive = r.status === 'scheduled' || r.status === 'in-progress'
                return isActive && hasAcceptedPassenger
              })
              .map(r => formatRide(r, 'driver'));
            
            const takenRides = user.TakenRides
              .filter(r => {
                const hasAcceptedPassenger = r.passengers && r.passengers.some(p => p.status === 'accepted')
                const isActive = r.status === 'scheduled' || r.status === 'in-progress'
                return isActive && hasAcceptedPassenger
              })
              .map(r => formatRide(r, 'passenger'));
            
            console.log(`[getUserRides] Given rides (active): ${givenRides.length}`)
            console.log(`[getUserRides] Taken rides (active): ${takenRides.length}`)
            
            const response = {
                rides: [...givenRides, ...takenRides]
            }
            
            console.log(`[getUserRides] Sending ${response.rides.length} rides`)
            res.json(response);
        } else {
            console.log(`[getUserRides] User not found`)
            res.status(404).json({ message: 'User not found' });
        }
    }
 catch (error) {
        console.error(`[getUserRides] Error: ${error.message}`)
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get user's ride history
// @route   GET /api/rides/history
// @access  Private
const getRideHistory = async (req, res) => {
    try {
        const userId = req.user.id;
        console.log(`[getRideHistory] Fetching ride history for user: ${userId}`);

        const user = await User.findById(userId)
            .populate({
                path: 'GivenRides',
                populate: { path: 'driver', select: 'name Rating' },
                select: 'status startLocation endLocation departureTime availableSeats price passengers'
            })
            .populate({
                path: 'TakenRides',
                populate: { path: 'driver', select: 'name Rating' },
                select: 'status startLocation endLocation departureTime availableSeats price passengers'
            });

        if (!user) {
            console.log(`[getRideHistory] User not found`);
            return res.status(404).json({ message: 'User not found' });
        }

        const formatRide = (ride, role) => ({
            id: ride._id,
            from: ride.startLocation,
            to: ride.endLocation,
            date: ride.departureTime ? new Date(ride.departureTime).toLocaleDateString() : 'N/A',
            time: ride.departureTime ? new Date(ride.departureTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A',
            driver: ride.driver ? { id: ride.driver._id, name: ride.driver.name, rating: ride.driver.Rating || 0 } : { id: null, name: 'Unknown', rating: 0 },
            rating: ride.driver?.Rating || 0,
            seats: ride.availableSeats,
            fare: ride.price ? `₹${ride.price}` : 'N/A',
            status: ride.status,
            role,
            passengers: ride.passengers
        });


        // For drivers, show active (scheduled/in-progress) rides with accepted passengers, and completed/cancelled rides
        const givenRides = user.GivenRides
            .filter(r => {
                // Completed/cancelled always included
                if (r.status === 'completed' || r.status === 'cancelled') return true;
                // Active rides only if at least one accepted passenger
                if ((r.status === 'scheduled' || r.status === 'in-progress') && r.passengers && r.passengers.some(p => p.status === 'accepted')) return true;
                return false;
            })
            .map(r => formatRide(r, 'driver'));

        // For passengers, show active and completed rides
        const takenRides = user.TakenRides
            .filter(r => r.status === 'scheduled' || r.status === 'in-progress' || r.status === 'completed' || r.status === 'cancelled')
            .map(r => formatRide(r, 'passenger'));

        console.log(`[getRideHistory] Found ${givenRides.length} completed/cancelled given rides.`);
        console.log(`[getRideHistory] Found ${takenRides.length} active/completed/cancelled taken rides.`);

        const response = {
            rides: [...givenRides, ...takenRides].sort((a, b) => new Date(b.date) - new Date(a.date))
        };

        res.json(response);
    } catch (error) {
        console.error(`[getRideHistory] Error: ${error.message}`);
        res.status(500).json({ message: error.message });
    }
};


// @desc    Confirm payment and end ride
// @route   POST /api/rides/:id/confirm-payment
// @access  Private
const confirmPaymentAndEndRide = async (req, res) => {
    try {
        const rideId = req.params.id;
        const driverId = req.user.id;
        const { driverLocation } = req.body; // { lat, lng }

        const ride = await Ride.findById(rideId).populate('passengers.user');

        if (!ride) {
            return res.status(404).json({ message: 'Ride not found' });
        }

        // Check if the user is the driver
        if (ride.driver.toString() !== driverId) {
            return res.status(403).json({ message: 'You are not authorized to perform this action' });
        }

        // For simplicity, we'll use the end location of the first accepted passenger.
        const acceptedPassengers = ride.passengers.filter(p => p.status === 'accepted');
        
        // Mark ride as completed
        ride.status = 'completed';
        await ride.save();

        if (acceptedPassengers.length === 0) {
            console.log(`[confirmPaymentAndEndRide] No accepted passengers, ride marked completed`)
            return res.json({ message: 'Ride completed successfully' });
        }

        const passengerDestination = acceptedPassengers[0].endLocation;
        const distance = haversineDistance(
            [driverLocation.lat, driverLocation.lng],
            [passengerDestination.lat, passengerDestination.lng]
        );

        console.log(`[confirmPaymentAndEndRide] Distance to destination: ${distance.toFixed(2)} km`)

        // Notify passenger
        const passenger = acceptedPassengers[0].user;
        passenger.notifications.push({
            title: 'Ride Completed',
            desc: `Your ride from ${ride.startLocation.name} to ${ride.endLocation.name} is complete. Distance: ${distance.toFixed(2)} km`,
            type: 'ride-confirmation',
            rideId: rideId
        });
        await passenger.save();

        res.json({ message: 'Ride completed successfully', distance: distance.toFixed(2) });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Passenger confirms ride completion
// @route   POST /api/rides/:id/passenger-confirm-completion
// @access  Private
const passengerConfirmRideCompletion = async (req, res) => {
    try {
        const rideId = req.params.id;
        const passengerId = req.user.id;

        const ride = await Ride.findById(rideId);

        if (!ride) {
            return res.status(404).json({ message: 'Ride not found' });
        }

        // Check if the user is a passenger on this ride
        const passengerEntry = ride.passengers.find(p => p.user.toString() === passengerId);
        if (!passengerEntry) {
            return res.status(403).json({ message: 'You are not a passenger on this ride' });
        }

        ride.status = 'completed';
        await ride.save();

        // Remove the 'ride-confirmation' notification from the passenger
        const passengerUser = await User.findById(passengerId);
        if (passengerUser) {
            passengerUser.notifications = passengerUser.notifications.filter(
                notif => !(notif.type === 'ride-confirmation' && notif.rideId && notif.rideId.toString() === rideId)
            );
            passengerUser.notifications.push({
                title: 'Ride Confirmed',
                desc: `You have confirmed the completion of your ride from ${ride.startLocation.name} to ${ride.endLocation.name}.`,
                type: 'ride-update'
            });
            await passengerUser.save();
        }

        res.json({ message: 'Ride completion confirmed by passenger.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get driver's current in-progress ride
// @route   GET /api/rides/in-progress
// @access  Private (Driver)
const getDriverInProgressRide = async (req, res) => {
    try {
        const driverId = req.user.id;

        const ride = await Ride.findOne({
            driver: driverId,
            status: 'in-progress'
        })
        .populate('driver', 'name Rating')
        .populate('passengers.user', 'name status'); // Populate passenger user details and status

        if (!ride) {
            return res.status(200).json({ message: 'No in-progress ride found for this driver.' });
        }

        res.status(200).json(ride);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get driver's pending ride requests
// @route   GET /api/rides/requests
// @access  Private (Driver)
const getDriverRideRequests = async (req, res) => {
    try {
        const driverId = req.user.id;
        console.log(`\n[getDriverRideRequests] Fetching pending requests for driver: ${driverId}`)

        const ridesWithPendingRequests = await Ride.find({
            driver: driverId,
            'passengers.status': 'pending'
        })
        .populate('passengers.user', 'name Rating'); // Populate passenger user details

        console.log(`[getDriverRideRequests] Found ${ridesWithPendingRequests.length} rides with pending requests`)

        // Format the requests for the frontend
        const formattedRequests = [];
        ridesWithPendingRequests.forEach((ride, rideIdx) => {
            console.log(`[getDriverRideRequests] Ride ${rideIdx}: ${ride.startLocation.name} → ${ride.endLocation.name}`)
            ride.passengers.forEach((passenger, passengerIdx) => {
                console.log(`  Passenger ${passengerIdx}: ${passenger.user.name} - Status: ${passenger.status}`)
                if (passenger.status === 'pending') {
                    formattedRequests.push({
                        rideId: ride._id,
                        passengerId: passenger.user._id,
                        passengerName: passenger.user.name,
                        passengerRating: passenger.user.Rating,
                        from: passenger.startLocation.name,
                        to: passenger.endLocation.name,
                        date: ride.departureTime.toLocaleDateString(),
                        time: ride.departureTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                        // Add other relevant ride details if needed
                    });
                }
            });
        });

        console.log(`[getDriverRideRequests] Formatted ${formattedRequests.length} pending requests`)
        res.status(200).json(formattedRequests);
    } catch (error) {
        console.error(`[getDriverRideRequests] Error: ${error.message}`)
        res.status(500).json({ message: error.message });
    }
};

// @desc    Accept a ride request
// @route   PUT /api/rides/:rideId/requests/:passengerId/accept
// @access  Private (Driver)
const acceptRideRequest = async (req, res) => {
    try {
        const { rideId, passengerId } = req.params;
        const driverId = req.user.id;

        console.log(`\n[acceptRideRequest] Driver ${driverId} accepting passenger ${passengerId} for ride ${rideId}`)

        const ride = await Ride.findById(rideId);

        if (!ride) {
            console.log(`[acceptRideRequest] Ride not found`)
            return res.status(404).json({ message: 'Ride not found' });
        }

        // Check if the user is the driver of this ride
        if (ride.driver.toString() !== driverId) {
            console.log(`[acceptRideRequest] Not authorized - driver mismatch`)
            return res.status(403).json({ message: 'You are not authorized to perform this action' });
        }

        const passengerEntry = ride.passengers.find(p => p.user.toString() === passengerId);

        if (!passengerEntry) {
            console.log(`[acceptRideRequest] Passenger not found in ride`)
            return res.status(404).json({ message: 'Passenger not found in this ride' });
        }

        if (passengerEntry.status !== 'pending') {
            console.log(`[acceptRideRequest] Passenger status not pending: ${passengerEntry.status}`)
            return res.status(400).json({ message: 'Ride request is not pending' });
        }

        if (ride.availableSeats <= 0) {
            console.log(`[acceptRideRequest] No available seats`)
            return res.status(400).json({ message: 'No available seats left in this ride' });
        }

        passengerEntry.status = 'accepted';
        ride.availableSeats--; // Decrement available seats upon acceptance

        await ride.save();
        console.log(`[acceptRideRequest] Passenger accepted. Available seats now: ${ride.availableSeats}`)

        // Notify passenger of acceptance
        const passengerUser = await User.findById(passengerId);
        if (passengerUser) {
            passengerUser.notifications.push({
                title: 'Ride Request Accepted',
                desc: `Your request to join the ride from ${ride.startLocation.name} to ${ride.endLocation.name} has been accepted!`,
                type: 'ride-update',
                rideId: ride._id,
                createdAt: new Date()
            });
            await passengerUser.save();
            console.log(`[acceptRideRequest] Passenger notified`)
        }

        res.status(200).json({ message: 'Ride request accepted successfully', ride });
    } catch (error) {
        console.error(`[acceptRideRequest] Error: ${error.message}`);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Reject a ride request
// @route   PUT /api/rides/:rideId/requests/:passengerId/reject
// @access  Private (Driver)
const rejectRideRequest = async (req, res) => {
    try {
        const { rideId, passengerId } = req.params;
        const driverId = req.user.id;

        const ride = await Ride.findById(rideId);

        if (!ride) {
            return res.status(404).json({ message: 'Ride not found' });
        }

        // Check if the user is the driver of this ride
        if (ride.driver.toString() !== driverId) {
            return res.status(403).json({ message: 'You are not authorized to perform this action' });
        }

        const passengerIndex = ride.passengers.findIndex(p => p.user.toString() === passengerId);

        if (passengerIndex === -1) {
            return res.status(404).json({ message: 'Passenger not found in this ride' });
        }

        if (ride.passengers[passengerIndex].status !== 'pending') {
            return res.status(400).json({ message: 'Ride request is not pending' });
        }

        // Remove passenger from the ride
        ride.passengers.splice(passengerIndex, 1);
        // No need to increment availableSeats as it was not decremented for pending requests

        await ride.save();

        // Notify passenger of rejection
        const passengerUser = await User.findById(passengerId);
        if (passengerUser) {
            passengerUser.notifications.push({
                title: 'Ride Request Rejected',
                desc: `Your request to join the ride from ${ride.startLocation.name} to ${ride.endLocation.name} has been rejected.`,
                type: 'ride-update',
                rideId: ride._id,
                createdAt: new Date()
            });
            await passengerUser.save();
        }

        res.status(200).json({ message: 'Ride request rejected successfully', ride });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Start a ride (mark as in-progress)
// @route   POST /api/rides/:id/start
// @access  Private (Driver)
const startRide = async (req, res) => {
    try {
        const rideId = req.params.id;
        const driverId = req.user.id;

        console.log(`\n[startRide] Driver ${driverId} starting ride ${rideId}`);

        const ride = await Ride.findById(rideId);

        if (!ride) {
            console.log(`[startRide] Ride not found`);
            return res.status(404).json({ message: 'Ride not found' });
        }

        // Check if the user is the driver of this ride
        if (ride.driver.toString() !== driverId) {
            console.log(`[startRide] Not authorized - driver mismatch`);
            return res.status(403).json({ message: 'You are not authorized to perform this action' });
        }

        // Check if ride has at least one accepted passenger
        const acceptedPassengers = ride.passengers.filter(p => p.status === 'accepted');
        if (acceptedPassengers.length === 0) {
            console.log(`[startRide] No accepted passengers`);
            return res.status(400).json({ message: 'Cannot start ride without accepted passengers' });
        }

        // Check if ride is in scheduled status
        if (ride.status !== 'scheduled') {
            console.log(`[startRide] Ride is not in scheduled status: ${ride.status}`);
            return res.status(400).json({ message: `Ride is already ${ride.status}` });
        }

        // Mark ride as in-progress
        ride.status = 'in-progress';
        await ride.save();

        console.log(`[startRide] Ride marked as in-progress. Accepted passengers: ${acceptedPassengers.length}`);

        // Notify passengers that ride has started
        const User = require('../models/User');
        for (const passenger of acceptedPassengers) {
            const passengerUser = await User.findById(passenger.user);
            if (passengerUser) {
                passengerUser.notifications = passengerUser.notifications || [];
                passengerUser.notifications.push({
                    title: 'Ride Started',
                    desc: `Your ride from ${ride.startLocation.name} to ${ride.endLocation.name} has started!`,
                    type: 'ride-update',
                    rideId: ride._id,
                    createdAt: new Date()
                });
                await passengerUser.save();
            }
        }

        res.status(200).json({ 
            message: 'Ride started successfully', 
            ride,
            acceptedPassengers: acceptedPassengers.length 
        });
    } catch (error) {
        console.error(`[startRide] Error: ${error.message}`);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Rate a completed ride
// @route   POST /api/rides/:id/rate
// @access  Private (Passenger)
const rateRide = async (req, res) => {
    try {
        const rideId = req.params.id;
        const passengerId = req.userId || req.user._id;
        const { rating, comment } = req.body;

        // Validate rating
        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({ message: 'Rating must be between 1 and 5' });
        }

        const ride = await Ride.findById(rideId).populate('driver');

        if (!ride) {
            return res.status(404).json({ message: 'Ride not found' });
        }

        // Check if user is a passenger in this ride
        const passenger = ride.passengers.find(p => p.user.toString() === passengerId.toString());
        if (!passenger) {
            return res.status(403).json({ message: 'You are not a passenger in this ride' });
        }

        // Mark passenger as rated
        passenger.rating = rating;
        passenger.comment = comment || '';
        await ride.save();

        // Update driver's average rating
        const completedRides = await Ride.find({
            driver: ride.driver._id,
            'passengers.user': passengerId,
            status: 'completed'
        });

        let totalRating = 0;
        let ratingCount = 0;

        for (const completedRide of completedRides) {
            const ratedPassenger = completedRide.passengers.find(p => p.rating);
            if (ratedPassenger && ratedPassenger.rating) {
                totalRating += ratedPassenger.rating;
                ratingCount++;
            }
        }

        if (ratingCount > 0) {
            ride.driver.Rating = totalRating / ratingCount;
            await ride.driver.save();
        }

        res.json({ success: true, message: 'Ride rated successfully', rating: ride.driver.Rating });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
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
};
