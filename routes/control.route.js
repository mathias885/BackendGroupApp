const express = require('express');
const router = express.Router();
const Draft = require('../modules/event_draft.module');
const Event = require('../modules/event.module');
const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;


router.post('/:id',async (req, res) => {
    try {
        console.log(req.body._id);

        let id = req.body._id;
       const draft = await Draft.findById(id);
        
        console.log("draft found");
        if (!draft) {
            return res.status(404).json({ message: 'Evento non trovato' });
        }

        const eventInstance = new Event({
            title: draft.title,
            date: draft.date,
            location: draft.location,
            price: draft.price
        });
    
        // Salva l'evento nel database
        eventInstance.save();
        
        await Draft.findByIdAndDelete(id);

        res.json(draft);
    } catch (err) {
        res.status(500).send("Errore durante il recupero dei drafts");
    }
});

router.delete('/:id',async (req, res) => {
    try {
        const deletedEvent = await Event.findByIdAndDelete(req.params.id);
        if (!deletedEvent) {
            return res.status(404).json({ message: 'Evento non trovato' });
        }
        res.json({ message: 'Evento eliminato con successo', deletedEvent });
    } catch (err) {
        res.status(500).json({ message: 'Errore del server', error: err.message });
    }
});


module.exports = router;
