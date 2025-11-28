const Ride = require("../models/Ride");
const User = require("../models/User");
const turf = require("@turf/turf");

// Check if a point is within maxDistance of closest route point
function findClosestRouteIndex(routePolyline, point, maxDistanceKm = 2) {
    let closestIndex = -1;
    let closestDistance = Infinity;

    for (let i = 0; i < routePolyline.length; i++) {
        const routePoint = turf.point(routePolyline[i]);
        const targetPoint = turf.point(point);

        const distance = turf.distance(routePoint, targetPoint, {
            units: "kilometers"
        });

        if (distance < closestDistance) {
            closestDistance = distance;
            closestIndex = i;
        }

        if (distance <= maxDistanceKm) {
            return i; // Return first point within maxDistance
        }
    }

    // Return closest point if within expanded search radius
    return (closestDistance <= maxDistanceKm) ? closestIndex : -1;
}

exports.searchRides = async (req, res) => {
    try {
        console.log('\n========================================');
        console.log('🔍 [SEARCH] Starting ride search...');
        console.log('========================================');

        const { pickup, drop, date } = req.body;

        console.log('📍 [SEARCH] Request received:');
        console.log(`  Pickup: [${pickup?.lng}, ${pickup?.lat}]`);
        console.log(`  Drop: [${drop?.lng}, ${drop?.lat}]`);
        console.log(`  Date: ${date || 'Not specified'}`);

        if (!pickup || !drop) {
            console.error('❌ [SEARCH] Missing pickup or drop coordinates');
            return res.status(400).json({ message: "Pickup and drop coordinates required" });
        }

        // Convert to [lng, lat]
        const pickupPoint = [pickup.lng, pickup.lat];
        const dropPoint = [drop.lng, drop.lat];

        console.log('🗄️  [SEARCH] Fetching rides from database...');

        // Build query for future rides
        let dateFilter = { $gte: new Date() };

        if (date) {
            const searchDate = new Date(date);
            const startOfDay = new Date(searchDate); startOfDay.setHours(0, 0, 0, 0);
            const endOfDay = new Date(searchDate); endOfDay.setHours(23, 59, 59, 999);

            // Ensure we don't show past rides even if date is today
            const now = new Date();
            let effectiveStart = startOfDay;
            if (effectiveStart < now) {
                effectiveStart = now;
            }

            dateFilter = { $gte: effectiveStart, $lte: endOfDay };
        }

        // Fetch blocked users logic
        const currentUser = await User.findById(req.user.id);
        // Users who have blocked the current user
        const blockers = await User.find({ blockedUsers: req.user.id }).select('_id');

        const blockedDriverIds = [
            ...(currentUser.blockedUsers || []),
            ...blockers.map(u => u._id)
        ];

        console.log(`🚫 [SEARCH] Excluding ${blockedDriverIds.length} blocked drivers`);

        // Fetch rides matching criteria
        const rides = await Ride.find({
            departureTime: dateFilter,
            availableSeats: { $gt: 0 },
            status: { $ne: 'cancelled' },
            driver: { $nin: blockedDriverIds }
        }).populate("driver", "name Rating email");

        console.log(`✅ [SEARCH] Found ${rides.length} available rides matching criteria`);

        if (rides.length === 0) {
            console.log('⚠️  [SEARCH] No rides matching criteria');
        }
        console.log('\n📋 [SEARCH] Ride details:');
        rides.forEach((ride, idx) => {
            console.log(`  ${idx + 1}. ID: ${ride._id}`);
            console.log(`     Driver: ${ride.driver?.name}`);
            console.log(`     startLocation: ${JSON.stringify(ride.startLocation)}`);
            console.log(`     endLocation: ${JSON.stringify(ride.endLocation)}`);
            console.log(`     Route points: ${ride.routePolyline?.length || 0}`);
            if (ride.routePolyline?.length === 0) {
                console.log(`     ⚠️  EMPTY ROUTE POLYLINE!`);
            }
            console.log(`     Departure: ${ride.departureTime}`);
            console.log(`     Seats: ${ride.availableSeats}`);
            console.log(`     Status: ${ride.status}`);
        });

        let matches = [];

        for (const ride of rides) {
            const route = ride.routePolyline;

            console.log(`\n🔎 [SEARCH] Analyzing ride: ${ride._id}`);
            console.log(`  Search pickup: [${pickupPoint[0]}, ${pickupPoint[1]}]`);
            console.log(`  Search drop: [${dropPoint[0]}, ${dropPoint[1]}]`);
            console.log(`  Ride start: ${ride.startLocation?.name} [${ride.startLocation?.lng}, ${ride.startLocation?.lat}]`);
            console.log(`  Ride end: ${ride.endLocation?.name} [${ride.endLocation?.lng}, ${ride.endLocation?.lat}]`);

            if (!route || route.length === 0) {
                console.log(`  ❌ No route polyline found`);
                console.log(`     Route value: ${JSON.stringify(route)}`);
                continue;
            }

            console.log(`  Route: ${route.length} points, First: [${route[0][0]}, ${route[0][1]}], Last: [${route[route.length - 1][0]}, ${route[route.length - 1][1]}]`);

            const pickupIndex = findClosestRouteIndex(route, pickupPoint, 2); // 2km radius
            const dropIndex = findClosestRouteIndex(route, dropPoint, 2);

            console.log(`  Pickup match index: ${pickupIndex}`);
            console.log(`  Drop match index: ${dropIndex}`);

            if (pickupIndex === -1 || dropIndex === -1) {
                console.log(`  ❌ Points not on route (pickup=${pickupIndex}, drop=${dropIndex})`);
                continue;
            }

            // Ensure passenger is traveling in same direction (pickup before drop)
            if (pickupIndex < dropIndex) {
                // Ensure locations are included in response
                const startLoc = ride.startLocation || { name: 'Unknown', lat: 0, lng: 0 };
                const endLoc = ride.endLocation || { name: 'Unknown', lat: 0, lng: 0 };

                const match = {
                    _id: ride._id,
                    rideId: ride._id,
                    driver: ride.driver,
                    pickupIndex,
                    dropIndex,
                    departureTime: ride.departureTime,
                    availableSeats: ride.availableSeats,
                    price: ride.price,
                    notes: ride.notes,
                    startLocation: {
                        name: startLoc.name,
                        lat: startLoc.lat,
                        lng: startLoc.lng
                    },
                    endLocation: {
                        name: endLoc.name,
                        lat: endLoc.lat,
                        lng: endLoc.lng
                    },
                    status: ride.status
                };
                matches.push(match);
                console.log(`  ✅ MATCHED! (pickup index: ${pickupIndex}, drop index: ${dropIndex})`);
                console.log(`     Driver: ${ride.driver?.name}`);
                console.log(`     From: ${startLoc.name} [${startLoc.lng}, ${startLoc.lat}]`);
                console.log(`     To: ${endLoc.name} [${endLoc.lng}, ${endLoc.lat}]`);
                console.log(`     Seats: ${ride.availableSeats}`);
                console.log(`     Price: ₹${ride.price}`);
            } else {
                console.log(`  ❌ Wrong direction (pickup=${pickupIndex} should be < drop=${dropIndex})`);
            }
        }

        console.log(`\n📊 [SEARCH] Search complete:`);
        console.log(`   Total matches: ${matches.length}`);

        if (matches.length > 0) {
            console.log('\n📤 [SEARCH] Sending response with matched rides:');
            matches.forEach((match, idx) => {
                console.log(`  ${idx + 1}. Ride ID: ${match._id}`);
                console.log(`     Driver: ${match.driver?.name}`);
                console.log(`     From: ${match.startLocation?.name} [${match.startLocation?.lng}, ${match.startLocation?.lat}]`);
                console.log(`     To: ${match.endLocation?.name} [${match.endLocation?.lng}, ${match.endLocation?.lat}]`);
                console.log(`     Seats: ${match.availableSeats}, Price: ₹${match.price}`);
            });
        }

        console.log('========================================\n');

        res.json({ matches });

    } catch (err) {
        console.error('❌ [SEARCH] Error:', err);
        res.status(500).json({ message: err.message });
    }
};
