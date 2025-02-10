const express = require('express');
const router = express.Router();
const partecipation = require('../modules/partecipation.module');
const authenticateJWT = require('../middlewares/authenticateJWT');



router.post('/join', authenticateJWT, async (req, res) => {
    try {
        const userId = req.user.userId;
        const eventId = req.query.event;

        if (!eventId) {
            return res.status(400).send("ID evento mancante.");
        }

        // Verifica se l'utente è già iscritto all'evento
        const existingParticipation = await Participation.findOne({ userID: userId, eventID: eventId });

        if (existingParticipation) {
            return res.status(400).send("L'utente è già iscritto a questo evento.");
        }

        // Creazione della partecipazione
        const eventInstance = new Participation({
            userID: userId,
            eventID: eventId,
        });

        await eventInstance.save();
        res.send("Partecipazione creata con successo.");

    } catch (err) {
        console.error("Errore durante la partecipazione:", err);
        res.status(500).send("Errore interno del server.");
    }
});





// Elimina una partecipazione specifica
router.delete('/leave',authenticateJWT, async (req, res) => {
    try {
        userID = req.user.userId;
        eventID = req.query.event;

        // Elimina la partecipazione specifica
        const result = await partecipation.deleteOne({ userID, eventID });

        if (result.deletedCount === 0) {
            return res.status(404).send('Partecipazione non trovata');
        }

        res.send(`Partecipazione eliminata`);
    } catch (err) {
        res.status(500).send("Errore durante l'eliminazione della partecipazione");
    }
});

module.exports = router;
