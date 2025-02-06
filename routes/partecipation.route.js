const express = require('express');
const router = express.Router();
const partecipation = require('../modules/partecipation.module');
const authenticateJWT = require('../middlewares/authenticateJWT');



// Crea una nuova partecipazione
router.post('/',authenticateJWT, (req, res) => {
try{
    // Istanzia una nuova partecipazione con i dati ricevuti
    const eventInstance = new partecipation({

        userID: req.user.userId,
        eventID: req.body.event,
        
    });

    // Salva la partecipazione nel database
    eventInstance.save()
        .then(result => {
            res.send("partecipazione creata con successo");
        })
        .catch(err => {
            res.status(500).send("Errore durante il salvataggio della partecipazione");
        });
    }catch (err) {
        res.status(500).send("Errore durante la partecipazione");
    }

});





// Elimina una partecipazione specifica
router.delete('/single',authenticateJWT, async (req, res) => {
    try {
        userID = req.user.userId;
        eventID = req.body.event;

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
