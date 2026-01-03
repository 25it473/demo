const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const { protect } = require('../middleware/authMiddleware');

// @route   GET api/messages/:userId
// @desc    Get conversation with a user
// @access  Private
router.get('/:userId', protect, async (req, res) => {
    try {
        const messages = await Message.find({
            $or: [
                { sender: req.user._id, recipient: req.params.userId },
                { sender: req.params.userId, recipient: req.user._id }
            ]
        })
            .sort({ createdAt: 1 }) // Oldest first
            .populate('sender', 'username')
            .populate('recipient', 'username');

        res.json(messages);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   POST api/messages
// @desc    Send a message
// @access  Private
router.post('/', protect, async (req, res) => {
    const { recipientId, content } = req.body;

    try {
        const message = await Message.create({
            sender: req.user._id,
            recipient: recipientId,
            content
        });

        const populatedMessage = await Message.findById(message._id)
            .populate('sender', 'username')
            .populate('recipient', 'username');

        res.status(201).json(populatedMessage);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
