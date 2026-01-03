const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { protect } = require('../middleware/authMiddleware');

// Generate JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || 'secret123', {
        expiresIn: '30d',
    });
};

// @route   POST api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', async (req, res) => {
    const { username, password } = req.body;

    try {
        const userExists = await User.findOne({ username });

        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Check if this is the first user in the DB
        const isFirstAccount = (await User.countDocuments({})) === 0;
        const role = isFirstAccount ? 'admin' : 'member';
        const isApproved = isFirstAccount; // Admin is auto-approved

        const user = await User.create({
            username,
            password: hashedPassword,
            role,
            isApproved
        });

        if (user) {
            res.status(201).json({
                _id: user._id,
                username: user.username,
                role: user.role,
                isApproved: user.isApproved,
                token: generateToken(user._id),
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   POST api/auth/login
// @desc    Auth user & get token
// @access  Public
router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await User.findOne({ username });

        if (user && (await bcrypt.compare(password, user.password))) {
            if (!user.isApproved && user.role !== 'admin') {
                return res.status(401).json({ message: 'Account not approved by admin yet.' });
            }

            res.json({
                _id: user._id,
                username: user.username,
                role: user.role,
                image: user.profile?.image,
                isApproved: user.isApproved,
                token: generateToken(user._id),
            });
        } else {
            res.status(401).json({ message: 'Invalid username or password' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   POST api/auth/seed
// @desc    Seed admin user
// @access  Public (Should be protected or removed in prod)
router.post('/seed', async (req, res) => {
    try {
        const adminExists = await User.findOne({ role: 'admin' });
        if (adminExists) {
            return res.status(400).json({ message: 'Admin already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('admin123', salt);

        const admin = await User.create({
            username: 'admin',
            password: hashedPassword,
            role: 'admin',
            isApproved: true,
            profile: { name: 'Super Admin', bio: 'The Boss' }
        });

        res.status(201).json(admin);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   PUT api/auth/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', protect, async (req, res) => {
    console.log('Update Profile Request:', req.body);
    console.log('User ID:', req.user._id);

    try {
        const user = await User.findById(req.user._id);

        if (user) {
            console.log('User Found:', user.username);

            // Ensure profile exists
            if (!user.profile) {
                console.log('Initializing user.profile');
                user.profile = {};
            }

            // Update fields safely
            user.profile.name = req.body.name !== undefined ? req.body.name : user.profile.name;
            user.profile.bio = req.body.bio !== undefined ? req.body.bio : user.profile.bio;
            user.profile.contact = req.body.contact !== undefined ? req.body.contact : user.profile.contact;

            console.log('Saving user with profile:', user.profile);

            const updatedUser = await user.save();
            console.log('User Saved Successfully');

            const userResponse = updatedUser.toObject();
            delete userResponse.password;

            res.json(userResponse);
        } else {
            console.log('User not found in DB');
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        console.error('Profile Update Error:', error);
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
