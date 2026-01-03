const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Event = require('../models/Event');
const { protect, admin } = require('../middleware/authMiddleware');

// @route   GET api/admin/users/pending
// @desc    Get all pending users
// @access  Private/Admin
router.get('/users/pending', protect, admin, async (req, res) => {
    try {
        const users = await User.find({ isApproved: false, role: 'member' }).select('-password');
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   GET api/admin/users
// @desc    Get all approved members for team directory
// @access  Private (All users)
router.get('/users', protect, async (req, res) => {
    try {
        // Fetch all approved users (admins and members)
        const users = await User.find({ isApproved: true }).select('-password');
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   PUT api/admin/users/:id/approve
// @desc    Approve a user
// @access  Private/Admin
router.put('/users/:id/approve', protect, admin, async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (user) {
            user.isApproved = true;
            await user.save();
            res.json({ message: 'User approved' });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   DELETE api/admin/users/:id
// @desc    Reject/Delete a user
// @access  Private/Admin
router.delete('/users/:id', protect, admin, async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (user) {
            await user.deleteOne();
            res.json({ message: 'User removed' });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   PUT api/admin/users/:id/role
// @desc    Update user role (e.g. Promote to Admin)
// @access  Private/Admin
router.put('/users/:id/role', protect, admin, async (req, res) => {
    const { role } = req.body;
    try {
        const user = await User.findById(req.params.id);
        if (user) {
            user.role = role;
            await user.save();
            res.json({ message: `User role updated to ${role}`, user });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   PUT api/admin/events/:id/status
// @desc    Approve or decline event
// @access  Private/Admin
router.put('/events/:id/status', protect, admin, async (req, res) => {
    const { status } = req.body; // 'approved' or 'declined'
    try {
        const event = await Event.findById(req.params.id);
        if (event) {
            event.status = status;
            await event.save();
            res.json(event);
        } else {
            res.status(404).json({ message: 'Event not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
