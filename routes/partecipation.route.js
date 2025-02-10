const express = require('express');
const router = express.Router();
const partecipation = require('../modules/partecipation.module');
const authenticateJWT = require('../middlewares/authenticateJWT');



router.post('/join', authenticateJWT, (req, res) => {
    try {
        const userId = req.user.userId;
        const eventId = req.query.event;

        // Verifica se l'utente è già iscritto all'evento
        partecipation.findOne({ userID: userId, eventID: eventId })
            .then(existingParticipation => {
                if (existingParticipation) {
                    // L'utente è già iscritto all'evento
                    return res.status(400).send("L'utente è già iscritto a questo evento.");
                } 

                // Istanzia una nuova partecipazione se non esiste già
                const eventInstance = new partecipation({
                    userID: userId,
                    eventID: eventId,
                });

                // Salva la partecipazione nel database
                eventInstance.save()
                    .then(result => {
                        res.send("Partecipazione creata con successo.");
                    })
                    .catch(err => {
                        res.status(500).send("Errore durante il salvataggio della partecipazione.");
                    });
            })
            .catch(err => {
                res.status(500).send("Errore durante la verifica della partecipazione.");
            });

    } catch (err) {
        res.status(500).send("Errore durante la partecipazione.");
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
