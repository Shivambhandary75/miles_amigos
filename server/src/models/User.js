const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "please fill this block"]
    },
    email: {
        type: String,
        required: [true, "email is compulsory"],
        unique: true
    },
    password: {
        type: String
    },
    Rating: {
        type: Number,
        min: 0,
        max: 5,
        default: 0
    },

    GivenRides: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Ride"
    }],

    TakenRides: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Ride"
    }]

}, {
    timestamps: true
})

// Hash password before save
UserSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (err) {
        next(err)
    }
});

UserSchema.methods.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password)
}

const User = mongoose.model('User', UserSchema)

module.exports = User

