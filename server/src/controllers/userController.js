const User = require('../models/User')
const { generateToken } = require('../utils/token')

// Register new user
exports.Register = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email and password are required' })
    }

    const existingEmail = await User.findOne({ email })
    const existingPhone = phone ? await User.findOne({ phone }) : null

    if (existingEmail || existingPhone) {
      return res.status(400).json({ success: false, message: 'User already exists with provided credentials' })
    }

    const user = await User.create({ name, email, phone, password })
    const token = generateToken(user._id)

    return res.status(201).json({ success: true, user: { id: user._id, name: user.name, email: user.email, phone: user.phone }, token })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ success: false, message: 'Server error' })
  }
}

// Login existing user
exports.Login = async (req, res) => {
  try {
    const { email, password } = req.body
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' })
    }

    const user = await User.findOne({ email })
    if (!user) return res.status(401).json({ success: false, message: 'Invalid email or password' })

    const isMatch = await user.comparePassword(password)
    if (!isMatch) return res.status(401).json({ success: false, message: 'Invalid email or password' })

    const token = generateToken(user._id)
    return res.status(200).json({ success: true, user: { id: user._id, name: user.name, email: user.email, phone: user.phone }, token })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ success: false, message: 'Server error' })
  }
}

// Get current logged in user profile
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password')
    if (!user) return res.status(404).json({ success: false, message: 'User not found' })
    return res.status(200).json({ success: true, user })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ success: false, message: 'Server error' })
  }
}

