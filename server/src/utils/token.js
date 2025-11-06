const jwt = require('jsonwebtoken')

const generateToken = (id) => {
	return jwt.sign({ id }, process.env.JWT_SECRET || 'devsecret', { expiresIn: '30d' })
}

const verifyToken = (token) => {
	try {
		return jwt.verify(token, process.env.JWT_SECRET || 'devsecret')
	} catch (err) {
		return null
	}
}

module.exports = { generateToken, verifyToken }
