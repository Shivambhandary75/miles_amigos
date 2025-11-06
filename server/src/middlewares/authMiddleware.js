const { verifyToken } = require('../utils/token')
const User = require('../models/User')

// Middleware to protect routes
const protect = async (req, res, next) => {
	try {
		const authHeader = req.headers.authorization || req.headers.Authorization
		if (!authHeader || !authHeader.startsWith('Bearer ')) {
			return res.status(401).json({ success: false, message: 'Not authorized, token missing' })
		}

		const token = authHeader.split(' ')[1]
		const decoded = verifyToken(token)
		if (!decoded || !decoded.id) return res.status(401).json({ success: false, message: 'Not authorized, token invalid' })

		// attach user id to request
		req.userId = decoded.id
		// optional: load user
		const user = await User.findById(decoded.id).select('-password')
		if (!user) return res.status(401).json({ success: false, message: 'Not authorized, user not found' })
		req.user = user
		next()
	} catch (err) {
		console.error(err)
		return res.status(401).json({ success: false, message: 'Not authorized' })
	}
}

module.exports = { protect }
