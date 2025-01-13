const express = require('express');
const router = express.Router();
const partecipation = require('../modules/partecipation.module');


//assicurarsi che l id utente sia il proprio

// Crea una nuova partecipazione
router.post('/', (req, res) => {
    console.log("Dati ricevuti per l'evento:", req.body);

    // Istanzia una nuova partecipazione con i dati ricevuti
    const eventInstance = new partecipation({
        userID: req.body.user,
        eventID: req.body.event,
        
    });

    // Salva la partecipazione nel database
    eventInstance.save()
        .then(result => {
            console.log("partecipazione salvata con successo:", result);
            res.send("partecipazione creata con successo");
        })
        .catch(err => {
            console.error("Errore durante il salvataggio della partecipazione:", err);
            res.status(500).send("Errore durante il salvataggio della partecipazione");
        });
});



// Elimina tutte le partecipazioni con l'ID dell'evento

router.delete('/event', async (req, res) => {
    try {
        eventID = req.query.eventID;
        console.log(eventID);
        
        const result = await partecipation.deleteMany({ eventID });

        if (result.deletedCount === 0) {
            return res.status(404).send('Nessuna partecipazione trovata per questo evento');
        }

        res.send(`Eliminate ${result.deletedCount} partecipazioni per l'evento con ID ${eventID}`);
    } catch (err) {
        console.error("Errore durante l'eliminazione delle partecipazioni:", err);
        res.status(500).send("Errore durante l'eliminazione delle partecipazioni");
    }
});



// Elimina una partecipazione specifica dato userID ed eventID
router.delete('/:single', async (req, res) => {
    try {
        userID = req.body.user;
        eventID = req.body.event;

        // Elimina la partecipazione specifica
        const result = await partecipation.deleteOne({ userID, eventID });

        if (result.deletedCount === 0) {
            return res.status(404).send('Partecipazione non trovata');
        }

        res.send(`Partecipazione eliminata`);
    } catch (err) {
        console.error("Errore durante l'eliminazione della partecipazione:", err);
        res.status(500).send("Errore durante l'eliminazione della partecipazione");
    }
});

module.exports = router;
