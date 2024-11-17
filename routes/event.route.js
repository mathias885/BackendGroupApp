const express = require('express');
const router = express.Router();
const Event = require('../modules/event.module');

// Ottieni tutti gli eventi con prezzo superiore a 50
router.get('/', async (req, res) => {
    try {
        //parametri del filtro
        price=req.query.price;
        date=req.query.date;

        const results = await Event.find({
            price: { $lt: price },  // Filtro per eventi che costano meno di 50
            date: { $lt: date }  // Filtro per eventi prima di una certa data
        });
        
        res.send(results);

    } catch (error) {
        console.log("Errore durante il recupero degli eventi:", error.message);
        res.status(500).send("Errore durante il recupero degli eventi");
    }
    console.log("ricerca filtrata");
});

// Crea un nuovo evento
router.post('/', (req, res) => {
    console.log("Dati ricevuti per l'evento:", req.body);

    // Istanzia un nuovo evento con i dati ricevuti
    const eventInstance = new Event({
        title: req.body.title,
        date: req.body.date,
        location: req.body.location,
        price: req.body.price
    });

    // Salva l'evento nel database
    eventInstance.save()
        .then(result => {
            console.log("Evento salvato con successo:", result);
            res.send("Evento creato con successo");
        })
        .catch(err => {
            console.error("Errore durante il salvataggio dell'evento:", err);
            res.status(500).send("Errore durante il salvataggio dell'evento");
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
