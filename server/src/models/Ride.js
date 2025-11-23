const mongoose = require('mongoose');

const LocationSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    lat: {
        type: Number,
        required: true
    },
    lng: {
        type: Number,
        required: true
    }
}, { _id: false }); // don't create separate _id for this subdocument

const RideSchema = new mongoose.Schema({
    driver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    startLocation: {
        type: LocationSchema,
        required: true
    },

    endLocation: {
        type: LocationSchema,
        required: true
    },

    routePolyline: {
        type: [[Number]], // [[lng, lat], [lng, lat], ...]
        required: true
    },

    routeGeoJSON: {
        type: {
            type: String,
            enum: ['LineString'],
            default: 'LineString'
        },
        coordinates: {
            type: [[Number]], // [[lng, lat], ...]
            required: true
        }
    },

    departureTime: {
        type: Date,
        required: true
    },

    availableSeats: {
        type: Number,
        required: true
    },

    price: {
        type: Number,
        required: true
    },

    notes: {
        type: String,
        default: ""
    },

    status: {
        type: String,
        enum: ['scheduled', 'in-progress', 'completed', 'cancelled'],
        default: 'scheduled'
    },

    passengers: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        startLocation: {
            type: LocationSchema,
            required: true
        },
        endLocation: {
            type: LocationSchema,
            required: true
        },
        status: {
            type: String,
            enum: ['pending', 'accepted', 'rejected'],
            default: 'pending'
        },
        rating: {
            type: Number,
            min: 1,
            max: 5,
            default: null
        },
        comment: {
            type: String,
            default: ''
        }
    }]

}, { timestamps: true });

RideSchema.index({ routeGeoJSON: "2dsphere" });

module.exports = mongoose.model('Ride', RideSchema);
