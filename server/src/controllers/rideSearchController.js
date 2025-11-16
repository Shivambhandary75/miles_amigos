const Ride = require("../models/Ride");
const turf = require("@turf/turf");

// Check if a point is within 300 meters of route
function findClosestRouteIndex(routePolyline, point, maxDistanceKm = 0.3) {
    let closestIndex = -1;

    for (let i = 0; i < routePolyline.length; i++) {
        const routePoint = turf.point(routePolyline[i]);
        const targetPoint = turf.point(point);

        const distance = turf.distance(routePoint, targetPoint, {
            units: "kilometers"
        });

        if (distance <= maxDistanceKm) {
            closestIndex = i;
            break;
        }
    }

    return closestIndex;
}

exports.searchRides = async (req, res) => {
    try {
        const { pickup, drop } = req.body;

        if (!pickup || !drop) {
            return res.status(400).json({ message: "Pickup and drop coordinates required" });
        }

        // Convert to [lng, lat]
        const pickupPoint = [pickup.lng, pickup.lat];
        const dropPoint = [drop.lng, drop.lat];

        // Fetch all future rides with seats
        const rides = await Ride.find({
            departureTime: { $gte: new Date() },
            availableSeats: { $gt: 0 }
        }).populate("driver", "name Rating");

        let matches = [];

        for (const ride of rides) {
            const route = ride.routePolyline;

            const pickupIndex = findClosestRouteIndex(route, pickupPoint);
            const dropIndex = findClosestRouteIndex(route, dropPoint);

            if (pickupIndex === -1 || dropIndex === -1) continue;

            // Ensure passenger is traveling in same direction
            if (pickupIndex < dropIndex) {
                matches.push({
                    rideId: ride._id,
                    driver: ride.driver,
                    pickupIndex,
                    dropIndex,
                    departureTime: ride.departureTime,
                    availableSeats: ride.availableSeats,
                    price: ride.price,
                    pickupDistance: pickupIndex,
                    dropDistance: dropIndex
                });
            }
        }

        res.json({ matches });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message });
    }
};
