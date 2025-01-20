const express = require('express');
const router = express.Router();
const Event = require('../modules/event.module');
const authenticateJWT = require('../middlewares/authenticateJWT');
const Draft = require('../modules/event_draft.module');
const Partecipation = require('../modules/partecipation.module');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;


// Ottieni tutti gli eventi con prezzo superiore a 50
router.get('/filtered',authenticateJWT, async (req, res) => {
    try {
        //parametri del filtro
        const start = parseInt(req.query.start, 10) || 0; // Default: 0 se non specificato
        price=req.query.price;
        date=req.query.date;

        const results = await Draft.find({
            price: { $lt: price },  // Filtro per eventi che costano meno di 50
            date: { $lt: date }  // Filtro per eventi prima di una certa data
        }).skip(start).limit(100);
        
        res.send(results);

    } catch (error) {
        console.log("Errore durante il recupero degli eventi:", error.message);
        res.status(500).send("Errore durante il recupero degli eventi");
    }
    console.log("ricerca filtrata");
});



// Ottieni i primi x eventi non filtrati
router.get('/',authenticateJWT, async (req, res) => {
    try {
      
        // Legge il parametro `start` dalla query string e lo converte in un numero
        const start = parseInt(req.query.start, 10) || 0; // Default: 0 se non specificato

        //data odierna
        const data = new Date();

        // Recupera i 100 eventi a partire dall'indice specificato
        const results = await Draft.find({date: { $gt: data }  // Filtro per eventi dopo di una certa data
        }).skip(start).limit(100);
        
        res.send(results);

    } catch (error) {
        console.log("Errore durante il recupero degli eventi:", error.message);
        res.status(500).send("Errore durante il recupero degli eventi");
    }
    console.log("ricerca filtrata");
});


// Crea un nuovo evento non serve perche sono creati su draft
router.post('/',authenticateJWT, (req, res) => {
    console.log("Dati ricevuti per l'evento:", req.body);
    // Istanzia un nuovo evento con i dati ricevuti
    const eventInstance = new Draft({
        title: req.body.title,
        date: req.body.date,
        location: req.body.location,
        price: req.body.price,
        category: req.body.category,
        description: req.body.description,
        max_subs: req.body.max_subs,
        organizer: req.body.organizer
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


//restituisce il numero di partecipanti ad un dato evento
router.get('/partecipants',authenticateJWT, async (req, res) => {
    try {
        //parametri del filtro
        event_id=req.query.id;

        const event = await Event.findById(event_id);

        if (!event) {
            return res.status(404).json({ message: 'Evento non trovato' });
        }

        // Conta i partecipanti per l'evento
        const participantsCount = await Partecipation.countDocuments({ event_id });
        
        res.send(results);

    } catch (error) {
        console.log("Errore durante il recupero degli eventi:", error.message);
        res.status(500).send("Errore durante il recupero degli eventi");
    }
    console.log("numero partecipanti");
});


// Ottieni evento per ID
router.get('/:id',authenticateJWT,async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) {
            return res.status(404).json({ message: 'Evento non trovato' });
        }
        res.json(event);
    } catch (err) {
        res.status(500).send("Errore durante il recupero degli eventi");
    }
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


//cambiare url

// Elimina draft per id
router.delete('/:idd',authenticateJWT,async (req, res) => {
    try {
        const deletedEvent = await Draft.findByIdAndDelete(req.params.id);
        if (!deletedEvent) {
            return res.status(404).json({ message: 'Evento non trovato' });
        }
        res.json({ message: 'Evento eliminato con successo', deletedEvent });
    } catch (err) {
        res.status(500).json({ message: 'Errore del server', error: err.message });
    }
});

module.exports = router;

