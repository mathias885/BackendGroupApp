const express = require('express');
const router = express.Router();
const User = require('../modules/user.module'); 
const bcrypt = require('bcrypt'); 

const SALT_ROUNDS = 10;

// Route to handle user registration
router.post('/', async (req, res) => {
    const { mail, password, name, dateOfBirth, surname, telephone } = req.body;

    // Validate required fields
    if (!mail || !password || !name || !dateOfBirth || !surname || !telephone) {
        return res.status(400).json({ error: 'Tutti i campi devono essere compilati' });
    }

    try {
        // Controlla se l'e-mail usata è già presente nel database
        const existingUser = await User.findOne({ mail });
        if (existingUser) {
            return res.status(409).json({
                 error: {
                    status: 409,
                    message: 'Esiste già un utente registrato con questa e-mail'
                    }
                });
        }

        // Hash the password before saving it
        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);


        // Crea un nuovo User
        const newUser = new User({
            mail,
            password: hashedPassword,
            name,
            dateOfBirth,
            surname,
            telephone,
        });

        // Salva il nuovo user nel database
        await newUser.save();

        res.status(201).json({ message: 'Utente ragistrato con successo' });
    } catch (err) {
        console.error('Errore di registrazione:', err.message);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
