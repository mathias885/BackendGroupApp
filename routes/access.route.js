const express = require('express');
const router = express.Router();
const User = require('../modules/user.module');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'default_secret_key'; // Secure in production

// Login Route
router.post('/', async (req, res) => {
    const { mail, password } = req.body;

    try {
        // Find user by email
        const user = await User.findOne({ mail });
        if (!user) {
            return res.status(401).json({ error: 'E-mail non valida' });
        }

        // Verify password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Password non valida' });
        }

        // Generate JWT
        const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '1h' });
        console.log({token, user});
        res.json({ token, user });

    } catch (err) {
        console.error('Login error:', err.message);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Logout Route
router.post('/logout', (req, res) => {
    res.json({ message: 'Logged out successfully' });
});

module.exports = router;
