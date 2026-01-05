const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Event = require('../models/Event');
const { protect, admin } = require('../middleware/authMiddleware');
const bcrypt = require('bcryptjs');

// @route   POST api/admin/users
// @desc    Create a new user (admin or member) - defaults to isApproved: false
// @access  Private/Admin
router.post('/users', protect, admin, async (req, res) => {
    const { username, email, password, role } = req.body;

    try {
        const userExists = await User.findOne({ username });
        if (userExists) return res.status(400).json({ message: 'Username already exists' });

        const emailExists = await User.findOne({ email });
        if (emailExists) return res.status(400).json({ message: 'Email already exists' });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Always create as unapproved, even if admin created them
        const user = await User.create({
            username,
            email,
            password: hashedPassword,
            role: role || 'member',
            isApproved: false
        });

        if (user) {
            res.status(201).json({
                _id: user._id,
                username: user.username,
                email: user.email,
                role: user.role,
                isApproved: user.isApproved,
                message: 'User created successfully. They are pending approval.'
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

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

// @route   GET api/admin/total-users
// @desc    Get all users (approved and pending)
// @access  Private/Admin
router.get('/total-users', protect, admin, async (req, res) => {
    try {
        const users = await User.find({}).select('-password');
        console.log(`API total-users returning ${users.length} records`);
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
