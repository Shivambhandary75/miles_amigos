const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const User = require('../models/User');
const { protect } = require('../middlewares/authMiddleware');

// Get conversations list (last message from each user)
router.get('/conversations', protect, async (req, res) => {
    try {
        // Find all messages where current user is sender or receiver
        const messages = await Message.find({
            $or: [{ sender: req.user.id }, { receiver: req.user.id }]
        }).sort({ createdAt: -1 }).populate('sender', 'name avatar').populate('receiver', 'name avatar');

        const conversations = [];
        const seenUsers = new Set();

        messages.forEach(msg => {
            const otherUser = msg.sender._id.toString() === req.user.id ? msg.receiver : msg.sender;
            if (!seenUsers.has(otherUser._id.toString())) {
                seenUsers.add(otherUser._id.toString());
                conversations.push({
                    user: otherUser,
                    lastMessage: msg.content,
                    timestamp: msg.createdAt,
                    read: msg.read
                });
            }
        });

        res.json(conversations);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get messages with a specific user
router.get('/:userId', protect, async (req, res) => {
    try {
        const messages = await Message.find({
            $or: [
                { sender: req.user.id, receiver: req.params.userId },
                { sender: req.params.userId, receiver: req.user.id }
            ]
        }).sort({ createdAt: 1 });

        res.json(messages);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Send a message
router.post('/', protect, async (req, res) => {
    try {
        const { receiverId, content } = req.body;

        const message = await Message.create({
            sender: req.user.id,
            receiver: receiverId,
            content
        });

        // Populate sender info for immediate frontend display
        await message.populate('sender', 'name avatar');

        // Emit socket event if socket is available (optional enhancement)
        const io = req.app.get('io');
        if (io) {
            // This would require a way to map userId to socketId, skipping for now or broadcasting to a user-specific room if implemented
        }

        res.status(201).json(message);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;
