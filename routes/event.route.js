const express = require('express');
const router = express.Router();
const Event = require('../modules/event.module');
const authenticateJWT = require('../middlewares/authenticateJWT');
const Draft = require('../modules/event_draft.module');
const Partecipation = require('../modules/partecipation.module');
const Organization = require('../modules/organizations.module');
const mongoose = require('mongoose');
var ObjectId = require('mongodb').ObjectId;

// Ottieni eventi filtrati
router.get('/filtered', async (req, res) => {
    try {

         // Parametri del filtro da query
         const { start = 0, price, date, category, target, title } = req.query;

         // Costruzione dinamica dei filtri
         const filters = {};
         if (price) filters.price = { $lt: price };
         if (date) filters.date = { $gt: date };
         if (category) filters.category = category;
         if (target) filters.target = target;

         // Filtro per titolo (se presente)
        if (title) {
            const keywords = title.split(" ").filter(word => word.length > 0); // Divide la stringa in parole
            const regex = new RegExp(keywords.join("|"), "i"); // Crea una regex che cerca almeno una parola nel titolo
            filters.title = { $regex: regex };
        }

 
         // Recupero eventi con i filtri
         const results = await Event.find(filters).skip(start).limit(100);
         
        res.send(results);

    } catch (error) {
        res.status(500).send("Errore durante il recupero degli eventi");
    }
});



// Crea un nuovo evento
router.post('/create',authenticateJWT, (req, res) => {

    const organizer = req.user.userId; 

    // Istanzia un nuovo evento con i dati ricevuti
    const eventInstance = new Draft({
        title: req.body.title,
        date: req.body.date,
        location: req.body.location,
        price: req.body.price,
        target: req.body.target,
        category: req.body.category,
        description: req.body.description,
        max_subs: req.body.max_subs,
        organizer:organizer,
    });

    // Salva l'evento nel database
    eventInstance.save()
        .then(result => {
            res.send("Evento creato con successo");
        }).catch(err => {
            res.status(500).send("Errore durante il salvataggio dell'evento");
        });
});

//restituisce il numero di partecipanti ad un dato evento
router.get('/partecipants', async (req, res) => {
    try {

        //parametri del filtro
        const event_id = new mongoose.Types.ObjectId(req.query.id);
        
        // Conta i partecipanti per l'evento
        const participantsCount = await Partecipation.countDocuments({eventID: event_id });
        
        res.status(200).json({partecipants:participantsCount});

    } catch (error) {
        res.status(500).send("Errore durante il recupero degli eventi");
    }
});

// Ottieni evento per ID
router.get('/id',async (req, res) => {
    try {
        const event_id = new mongoose.Types.ObjectId(req.query.id);
        const event = await Event.findById(event_id);
        if (!event) {
            return res.status(404).json({ message: 'Evento non trovato' });
        }
        res.json(event);
    } catch (err) {
        res.status(500).send("Errore durante il recupero degli eventi");
    }
});



// Elimina evento per ID
router.delete('/delete_event', authenticateJWT, async (req, res) => {
    try {
        const eventId = new mongoose.Types.ObjectId(req.query.id);
        const userId=req.user.userId; 

        // Ottieni l'evento tramite ID
        const event = await Event.findById(eventId);

        if (!event) {
            return res.status(404).json({ message: 'Evento non trovato' });
        }

        // Verifica che l'utente sia il creatore dell'evento 
        const organizer = await Organization.findOne({eventID: eventId ,userID: userId });
        if (!organizer) {
            return res.status(403).json({ message: 'Non hai i permessi per eliminare questo evento' });
        }

        // Elimina l'evento
        await Event.deleteOne({ _id: eventId });

        //elimina le partecipazioni legate all'evento
        await Partecipation.deleteMany({eventID: eventId });
        await Organization.deleteMany({eventID: eventId });

        res.json({ message: 'Evento eliminato con successo' });
    } catch (err) {

        res.status(500).json({ message: 'Errore durante l\'eliminazione dell\'evento' });
    }
});


//cambiare url

// Elimina draft per id preso da query
router.delete('/delete_draft',authenticateJWT, async (req, res) => {
    try {
        // Ottieni l'evento tramite ID
        const draftid = new mongoose.Types.ObjectId(req.query.id)
        const draft = await Draft.findById(draftid);

        if (!draft) {
            return res.status(404).json({ message: 'Evento non trovato' });
        }

        // Verifica che l'utente sia il creatore dell'evento
        if (draft.organizer.toString() !== req.user.userId.toString()) {
            return res.status(403).json({ message: 'Non hai i permessi per eliminare questa draft' });
        }

        // Elimina l'evento
        await Draft.deleteOne({ _id: draftid });

        res.json({ message: 'draft eliminata con successo'});
    } catch (err) {
        res.status(500).json({ message: 'Errore del server', error: err.message });
    }
});


// Ottieni i primi 100 eventi organizzati dall'utente
router.get('/yourEvents', authenticateJWT, async (req, res) => {
    try {
        const start = parseInt(req.query.start, 10) || 0;  // Default: 0 se non specificato

        // Trova tutte le associazioni tra l'utente e gli eventi tramite la collezione Organizes
        const partecipates = await Organization.find({ userID: new ObjectId(req.user.userId) });

        if (!partecipates.length) {
            return res.status(404).json({ message: 'Nessun evento trovato per questo utente' });
        }

        // Ottieni gli ID degli eventi associati all'utente
        const eventIds = partecipates.map(org => org.eventID);

        // Recupera i primi 100 eventi a partire dagli ID trovati
        const events = await Event.find({ _id: { $in: eventIds } })
                                  .skip(start)
                                  .limit(100);

        res.json(events);
    } catch (err) {
        console.error('Errore durante il recupero degli eventi:', err.message);
        res.status(500).send("Errore durante il recupero degli eventi");
    }
});

// Ottieni i primi 100 eventi a cui partecipa l'utente
router.get('/yourPartecipations', authenticateJWT, async (req, res) => {
    try {
        const start = parseInt(req.query.start, 10) || 0;  // Default: 0 se non specificato

        // Trova tutte le associazioni tra l'utente e gli eventi tramite la collezione Organizes
        const partecipates = await Partecipation.find({ userID: new ObjectId(req.user.userId) });

        if (!partecipates.length) {
            return res.status(404).json({ message: 'Nessun evento trovato per questo utente' });
        }

        // Ottieni gli ID degli eventi associati all'utente
        const eventIds = partecipates.map(org => org.eventID);

        // Recupera i primi 100 eventi a partire dagli ID trovati
        const events = await Event.find({ _id: { $in: eventIds } })
                                  .skip(start)
                                  .limit(100);

        res.json(events);
    } catch (err) {
        console.error('Errore durante il recupero degli eventi:', err.message);
        res.status(500).send("Errore durante il recupero degli eventi");
    }
});


// Ottieni le prime 100 draft organizzati dall'utente
router.get('/yourDrafts', authenticateJWT, async (req, res) => {
    try {
        const start = parseInt(req.query.start, 10) || 0;  // Default: 0 se non specificato

        // Recupera i primi 100 eventi a partire dagli ID trovati
        const drafts = await Draft.find({ organizer: new ObjectId(req.user.userId) })
                                  .skip(start)
                                  .limit(100);

        res.json(drafts);
    } catch (err) {
        console.error('Errore durante il recupero degli eventi:', err.message);
        res.status(500).send("Errore durante il recupero degli eventi");
    }
});

module.exports = router;
