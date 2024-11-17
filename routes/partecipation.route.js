const express = require('express');
const router = express.Router();
const partecipation = require('../modules/partecipation.module');

// Ottieni tutti gli eventi con prezzo superiore a 50
router.get('/', async (req, res) => {
    
    console.log("ricerca partecipazione non filtrata");
});

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

// Ottieni evento per ID
router.get('/:id', (req, res) => {
    res.send("Recupero evento per ID");
});

// Aggiorna evento per ID
router.patch('/:id', (req, res) => {
    res.send("Aggiornamento evento per ID");
});

// Elimina evento per ID
router.delete('/:id', (req, res) => {
    res.send("Eliminazione evento per ID");
});

module.exports = router;
