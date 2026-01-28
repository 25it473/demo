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
// @route   POST api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', async (req, res) => {
    const { username, password, email } = req.body;

    try {
        const userExists = await User.findOne({ username });
        if (userExists) return res.status(400).json({ message: 'Username already exists' });

        const emailExists = await User.findOne({ email });
        if (emailExists) return res.status(400).json({ message: 'Email already exists' });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Check if this is the first user in the DB
        const count = await User.countDocuments({});
        const isFirstAccount = count === 0;
        console.log(`Registering user: ${username}, Count: ${count}, First: ${isFirstAccount}`);

        const role = isFirstAccount ? 'admin' : 'member';
        const isApproved = isFirstAccount; // Admin is auto-approved

        const user = await User.create({
            username,
            email,
            password: hashedPassword,
            role,
            isApproved
        });

        console.log(`User created: ${user.username}, Role: ${user.role}, Approved: ${user.isApproved}`);

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
        console.error("Registration Error:", error);
        res.status(500).json({ message: error.message, stack: process.env.NODE_ENV === 'production' ? null : error.stack });
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
            console.log(`Login attempt: ${username}, Role: ${user.role}, Approved: ${user.isApproved}`);

            if (!user.isApproved && user.role !== 'admin') {
                console.log("Login blocked: User not approved");
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

// @route   POST api/auth/google
// @desc    Login/Register with Google
// @access  Public
router.post('/google', async (req, res) => {
    const { token } = req.body;

    try {
        // Verify Firebase Token
        const admin = require('../config/firebase');
        const decodedToken = await admin.auth().verifyIdToken(token);
        const { uid, email, name, picture } = decodedToken;

        console.log("Google Login:", email);

        // Check if user exists
        let user = await User.findOne({ email });

        if (user) {
            // User exists, return token

            // Check approval logic if needed (Assuming Google Auth users are verified by email, but keeping admin approval logic)
            if (!user.isApproved && user.role !== 'admin') {
                return res.status(401).json({ message: 'Account not approved by admin yet.' });
            }

            // Optional: Update profile picture if missing
            if (picture && (!user.profile || !user.profile.image)) {
                if (!user.profile) user.profile = {};
                user.profile.image = picture;
                await user.save();
            }

            res.json({
                _id: user._id,
                username: user.username,
                email: user.email,
                role: user.role,
                isApproved: user.isApproved,
                token: generateToken(user._id),
                image: user.profile?.image
            });
        } else {
            // User does not exist - Redirect to Register
            console.log("User not found, redirecting to register...");
            res.json({
                needsRegistration: true,
                email: email,
                name: name,
                picture: picture
            });
        }

    } catch (error) {
        console.error("Google Auth Error:", error);
        res.status(401).json({ message: 'Invalid Google Token' });
    }
});

module.exports = router;
