const User = require("../models/User");
const Ride = require("../models/Ride");
const { generateToken } = require("../utils/token");

// Register new user
exports.Register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Name, email and password are required",
        });
    }

    const existingEmail = await User.findOne({ email });

    if (existingEmail) {
      return res
        .status(400)
        .json({
          success: false,
          message: "User already exists with provided credentials",
        });
    }

    const user = await User.create({ name, email, password });
    // log created user id for quick verification (do not log sensitive fields)
    console.log("User registered:", { id: user._id, email: user.email });
    const token = generateToken(user._id);

    return res
      .status(201)
      .json({
        success: true,
        user: { id: user._id, name: user.name, email: user.email },
        token,
      });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// Login existing user
exports.Login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "Email and password are required" });
    }

    const user = await User.findOne({ email });
    if (!user)
      return res
        .status(401)
        .json({ success: false, message: "Invalid email or password" });

    const isMatch = await user.comparePassword(password);
    if (!isMatch)
      return res
        .status(401)
        .json({ success: false, message: "Invalid email or password" });

    const token = generateToken(user._id);
    return res
      .status(200)
      .json({
        success: true,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
        },
        token,
      });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// Get current logged in user profile
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password");
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    return res.status(200).json({ success: true, user });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
exports.updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.userId);

    if (user) {
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;
      user.phone = req.body.phone !== undefined ? req.body.phone : user.phone;
      user.bio = req.body.bio !== undefined ? req.body.bio : user.bio;
      user.avatar = req.body.avatar !== undefined ? req.body.avatar : user.avatar;
      user.hasOwnCar = req.body.hasOwnCar !== undefined ? req.body.hasOwnCar : user.hasOwnCar;
      
      if (req.body.verifications) {
        user.verifications = { ...user.verifications, ...req.body.verifications };
      }
      
      if (req.body.password) {
        user.password = req.body.password;
      }

      const updatedUser = await user.save();

      res.json({
        success: true,
        user: {
          _id: updatedUser._id,
          name: updatedUser.name,
          email: updatedUser.email,
          phone: updatedUser.phone,
          bio: updatedUser.bio,
          avatar: updatedUser.avatar,
          rating: updatedUser.Rating,
          verifications: updatedUser.verifications,
          hasOwnCar: updatedUser.hasOwnCar
        }
      });
    } else {
      res.status(404).json({ success: false, message: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get user notifications
// @route   GET /api/users/notifications
// @access  Private
exports.getNotifications = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('notifications');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    return res.status(200).json({ success: true, notifications: user.notifications || [] });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get user dashboard stats
// @route   GET /api/users/stats
// @access  Private
exports.getUserStats = async (req, res) => {
  try {
    const user = await User.findById(req.userId).populate(
      "GivenRides TakenRides"
    );

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Count rides offered (GivenRides)
    const ridesOffered = user.GivenRides.length;

    // Count rides taken (TakenRides)
    const ridesTaken = user.TakenRides.length;

    // Calculate total earnings from completed rides where user is the driver
    let totalEarnings = 0;
    for (const rideId of user.GivenRides) {
      const ride = await Ride.findById(rideId);
      if (ride && ride.status === "completed") {
        // Calculate earnings: price * (total seats - available seats)
        const seatsBooked =
          ride.availableSeats > 0
            ? ride.price * ride.availableSeats
            : ride.price;
        totalEarnings += ride.price;
      }
    }

    return res.status(200).json({
      success: true,
      stats: {
        ridesOffered,
        ridesTaken,
        totalEarnings,
      },
    });
  } catch (error) {
    console.error("Error fetching user stats:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// @desc    Confirm ride completion
// @route   POST /api/users/rides/:id/confirm-completion
// @access  Private
exports.confirmRideCompletion = async (req, res) => {
    try {
        const rideId = req.params.id;
        const passengerId = req.userId;

        const ride = await Ride.findById(rideId).populate('driver');

        if (!ride) {
            return res.status(404).json({ message: 'Ride not found' });
        }

        const isPassenger = ride.passengers.some(p => p.user.equals(passengerId));

        if (!isPassenger) {
            return res.status(403).json({ message: 'You are not authorized to perform this action' });
        }

        ride.status = 'completed';
        await ride.save();

        // Notify driver
        const driver = ride.driver;
        driver.notifications.push({
            title: 'Ride Completed',
            desc: `The passenger has confirmed the completion of the ride from ${ride.startLocation.name} to ${ride.endLocation.name}.`,
            type: 'ride-update'
        });
        await driver.save();

        res.json({ message: 'Ride completion confirmed' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Add a friend
// @route   POST /api/users/add-friend
// @access  Private
exports.addFriend = async (req, res) => {
    try {
        const { friendId } = req.body;
        const userId = req.userId;

        if (!friendId) {
            return res.status(400).json({ success: false, message: 'Friend ID is required' });
        }

        const user = await User.findById(userId);
        const friend = await User.findById(friendId);

        if (!user || !friend) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Check if already friends
        if (user.friends.includes(friendId)) {
            return res.status(400).json({ success: false, message: 'Already friends with this user' });
        }

        // Add friend
        user.friends.push(friendId);
        await user.save();

        res.json({ success: true, message: 'Friend added successfully' });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Get user's friends
// @route   GET /api/users/friends
// @access  Private
exports.getFriends = async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        if (!user) {
          return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Find all completed rides where user was driver or passenger
        const completedRides = await Ride.find({
          status: 'completed',
          $or: [
            { driver: user._id },
            { 'passengers.user': user._id }
          ]
        }).populate('driver', 'name email Rating avatar phone').populate('passengers.user', 'name email Rating avatar phone');

        // Collect all unique user IDs (other than self) from these rides
        const riderMap = new Map();
        for (const ride of completedRides) {
          // Add driver if not self
          if (ride.driver && ride.driver._id.toString() !== user._id.toString()) {
            riderMap.set(ride.driver._id.toString(), ride.driver);
          }
          // Add all passengers except self
          for (const p of ride.passengers) {
            if (p.user && p.user._id.toString() !== user._id.toString()) {
              riderMap.set(p.user._id.toString(), p.user);
            }
          }
        }

        // Get ride counts for each rider
        const friendsWithStats = await Promise.all(
          Array.from(riderMap.values()).map(async (rider) => {
            const ridesTogether = await Ride.countDocuments({
              status: 'completed',
              $or: [
                { driver: user._id, 'passengers.user': rider._id },
                { driver: rider._id, 'passengers.user': user._id }
              ]
            });
            return {
              _id: rider._id,
              name: rider.name,
              email: rider.email,
              avatar: rider.avatar,
              phone: rider.phone,
              rating: rider.Rating || 0,
              rides: ridesTogether
            };
          })
        );

        res.json({ success: true, friends: friendsWithStats });
    } catch (err) {
        console.error('Error in getFriends:', err);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Delete a friend
// @route   DELETE /api/users/friends/:friendId
// @access  Private
exports.deleteFriend = async (req, res) => {
    try {
        const { friendId } = req.params;
        const userId = req.userId;

        if (!friendId) {
            return res.status(400).json({ success: false, message: 'Friend ID is required' });
        }

        const user = await User.findByIdAndUpdate(
            userId,
            { $pull: { friends: friendId } },
            { new: true }
        );

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        res.json({ success: true, message: 'Friend removed successfully' });
    } catch (err) {
        console.error('Error in deleteFriend:', err);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
};
