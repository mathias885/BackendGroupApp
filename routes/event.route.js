const express = require('express');
const router = express.Router();
const Event = require('../modules/event.module');
const authenticateJWT = require('../middlewares/authenticateJWT');

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
        price: req.body.price,
        creator: req.user.userId
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
router.patch('/:id', authenticateJWT, async (req, res) => {
    try {
        // Ottieni l'evento tramite ID
        const event = await Event.findById(req.params.id);

        if (!event) {
            return res.status(404).json({ message: 'Evento non trovato' });
        }

        // Verifica che l'utente sia il creatore dell'evento
        if (event.creator.toString() !== req.user.userId) {
            return res.status(403).json({ message: 'Non hai i permessi per modificare questo evento' });
        }

        // Procedi con l'aggiornamento dell'evento 
        event.title = req.body.title || event.title;
        event.date = req.body.date || event.date;
        event.location = req.body.location || event.location;
        event.price = req.body.price || event.price;

        // Salva le modifiche
        await event.save();

        res.json({ message: 'Evento aggiornato con successo' });
    } catch (err) {
        console.error('Errore durante l\'aggiornamento dell\'evento:', err);
        res.status(500).json({ message: 'Errore durante l\'aggiornamento dell\'evento' });
    }
});

// Elimina evento per ID
router.delete('/:id', authenticateJWT, async (req, res) => {
    try {
        // Ottieni l'evento tramite ID
        const event = await Event.findById(req.params.id);

        if (!event) {
            return res.status(404).json({ message: 'Evento non trovato' });
        }

        // Verifica che l'utente sia il creatore dell'evento
        if (event.creator.toString() !== req.user.userId) {
            return res.status(403).json({ message: 'Non hai i permessi per eliminare questo evento' });
        }

        // Elimina l'evento
        await event.remove();

        res.json({ message: 'Evento eliminato con successo' });
    } catch (err) {
        console.error('Errore durante l\'eliminazione dell\'evento:', err);
        res.status(500).json({ message: 'Errore durante l\'eliminazione dell\'evento' });
    }
});

module.exports = router;
