const express = require('express');
const router = express.Router();
const Partecipation = require('../modules/partecipation.module');
const authenticateJWT = require('../middlewares/authenticateJWT');



router.post('/join', authenticateJWT, async (req, res) => {
    try {
        const userId = req.user.userId;
        const eventId = req.body.event;

        if (!eventId) {
            return res.status(400).send("ID evento mancante.");
        }

        // Verifica se l'utente è già iscritto all'evento
        const existingPartecipation = await Partecipation.findOne({ userID: userId, eventID: eventId });

        if (existingPartecipation) {
            return res.status(400).send("L'utente è già iscritto a questo evento.");
        }

        // Creazione della partecipazione
        const eventInstance = new Partecipation({
            userID: userId,
            eventID: eventId,
        });

        await eventInstance.save();
        return res.status(200).send("Partecipazione registrata con successo."); 

    } catch (err) {

        res.status(500).send("Errore interno del server.");
    }
});





router.delete('/leave', authenticateJWT, async (req, res) => {
    try {
        const userID = req.user.userId;
        const eventID = req.query.event;

        if (!eventID) {
            return res.status(400).send("ID evento mancante.");
        }

        // Elimina la partecipazione specifica
        const result = await Partecipation.deleteOne({ userID, eventID });

        if (result.deletedCount === 0) {
            return res.status(404).send("Partecipazione non trovata.");
        }

        return res.status(200).send("Partecipazione cancellata con successo."); 

    } catch (err) {

        res.status(500).send("Errore interno del server.");
    }
});

module.exports = router;
