const express = require('express');
const router = express.Router();
const User = require('../modules/user.module'); 
const jwt = require('jsonwebtoken');

const JWT_SECRET = 'secret_key'; // key finta, da cambiare in produzione

// Login Route
router.post('/login', async (req, res) => {
    const { mail, password } = req.body;

    try {
        // Trova utente tramite e-mail
        const user = await User.findOne({ mail });
        if (!user) {
            return res.status(401).json({ error: 'E-mail o password non valide' });
        }

        // Verifica password 
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ error: 'E-mail o password non valide' });
        }

        // Genera JWT
        const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '1h' });
        res.json({ token });
    } catch (err) {
        console.error('Login error:', err.message);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Logout Route (opzionale)
router.post('/logout', (req, res) => {
    res.json({ message: 'Logged out successfully' });
});

module.exports = router;
