const express = require('express');
const router = express.Router();
const Draft = require('../modules/event_draft.module');
const Event = require('../modules/event.module');
const User = require('../modules/user.module');
const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;
const authenticateJWT = require('../middlewares/authenticateJWT');


//approva un dato evento con id
router.post('/:id',authenticateJWT,async (req, res) => {
    
    try {
        const u = await User.findById(req.user.userId);
        console.log(u.isAdmin);
        if(!u.isAdmin){return res.status(404).json({ message: 'non sei un admin' });}


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


//elimina un dato evento con id
router.delete('/:id',authenticateJWT,async (req, res) => {
    try {

        const u = await User.findById(req.user.userId);
        console.log(u.isAdmin);
        if(!u.isAdmin){return res.status(404).json({ message: 'non sei un admin' });}

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
