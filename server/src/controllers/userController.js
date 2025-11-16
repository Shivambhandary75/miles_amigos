const User = require("../models/User");
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

// @desc    Get user dashboard stats
// @route   GET /api/users/stats
// @access  Private
exports.getUserStats = async (req, res) => {
  try {
    const Ride = require("../models/Ride");
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
