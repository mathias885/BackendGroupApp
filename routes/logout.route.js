const express = require('express');
const router = express.Router();
const authenticateJWT = require('../middlewares/authenticateJWT');
const { addToBlacklist } = require('../modules/blacklist.module'); // Import the shared blacklist module
const jwt = require('jsonwebtoken'); 


// Logout Route
router.post('/', (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(400).json({ error: 'Invalid Authorization header format' });
    }
    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.decode(token);
        if (!decoded || !decoded.exp) {
            return res.status(400).json({ error: 'Invalid token provided' });
        }

        const expiresAt = decoded.exp * 1000; // Convert expiration time to milliseconds
        addToBlacklist(token, expiresAt); // Add token to blacklist

        res.json({
            message: 'Logged out successfully',
            advice: 'Your token has been blacklisted and will no longer be valid.',
        });
    } catch (err) {
        console.error('Error in logout:', err.message);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;