const express = require('express');
const router = express.Router();
const Community = require('../models/Community');
const { protect } = require('../middlewares/authMiddleware');

// Get all communities
router.get('/', protect, async (req, res) => {
    try {
        const communities = await Community.find().select('-messages'); // Exclude messages for list view
        res.json(communities);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Create a community
router.post('/', protect, async (req, res) => {
    try {
        const { name, description, category, icon } = req.body;
        const community = await Community.create({
            name,
            description,
            category,
            icon,
            members: [req.user.id] // Creator joins automatically
        });
        res.status(201).json(community);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Join a community
router.post('/:id/join', protect, async (req, res) => {
    try {
        const community = await Community.findById(req.params.id);
        if (!community) {
            return res.status(404).json({ message: 'Community not found' });
        }

        if (community.members.includes(req.user.id)) {
            return res.status(400).json({ message: 'Already a member' });
        }

        community.members.push(req.user.id);
        await community.save();

        res.json(community);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Leave a community
router.post('/:id/leave', protect, async (req, res) => {
    try {
        const community = await Community.findById(req.params.id);
        if (!community) {
            return res.status(404).json({ message: 'Community not found' });
        }

        community.members = community.members.filter(member => member.toString() !== req.user.id);
        await community.save();

        res.json({ message: 'Left community' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get community messages
router.get('/:id/messages', protect, async (req, res) => {
    try {
        const community = await Community.findById(req.params.id).populate('messages.sender', 'name avatar');
        if (!community) {
            return res.status(404).json({ message: 'Community not found' });
        }
        res.json(community.messages);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Post a message to a community
router.post('/:id/messages', protect, async (req, res) => {
    try {
        const { content } = req.body;
        const community = await Community.findById(req.params.id);
        if (!community) {
            return res.status(404).json({ message: 'Community not found' });
        }

        const newMessage = {
            sender: req.user.id,
            content,
            timestamp: new Date()
        };

        community.messages.push(newMessage);
        await community.save();

        // Populate sender for return
        const updatedCommunity = await Community.findById(req.params.id).populate('messages.sender', 'name avatar');
        const addedMessage = updatedCommunity.messages[updatedCommunity.messages.length - 1];

        res.status(201).json(addedMessage);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;
