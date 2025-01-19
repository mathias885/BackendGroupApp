const express = require('express');
const router = express.Router();
const Draft = require('../modules/event_draft.module');
const Event = require('../modules/event.module');
const User = require('../modules/user.module');
const Organization = require('../modules/organizations.module');
const mongoose = require('mongoose');
const authenticateJWT = require('../middlewares/authenticateJWT');


//mostra le dreft
router.get('/:drafts',authenticateJWT,async (req, res) => {
    
    try {

        //controlla che l'user id appartenga ad un admin
        const u = await User.findById(req.user._id);
        if(!u.isAdmin){return res.status(404).json({ message: 'non sei un admin' });}



        // Legge il parametro `start` dalla query string e lo converte in un numero
        const start = parseInt(req.query.start, 10) || 0; // Default: 0 se non specificato

        //data odierna

        // Recupera i 100 eventi a partire dall'indice specificato
        const results = await Event.find().skip(start).limit(100);
        
        res.send(results);



    } catch (err) {
        res.status(500).send("Errore durante il recupero dei drafts");
    }
});

//approva un dato evento con id
router.post('/:id',authenticateJWT,async (req, res) => {
    
    try {
        //controlla che l'user id appartenga ad un admin
        const u = await User.findById(req.user._id);
        if(!u.isAdmin){return res.status(404).json({ message: 'non sei un admin' });}


        const id = new mongoose.Types.ObjectId(req.body.id);

        const draft = await Draft.findById(id);
        console.log(req.body.id);
        console.log(id);
        if (!draft) {
            return res.status(404).json({ message: 'draft non trovato' });
        }

        const eventInstance = new Event({
            title: draft.title,
            date: draft.date,
            location: draft.location,
            price: draft.price,
            targer: draft.target,
            category: draft.category,
            description: draft.description,
            max_subs: draft.max_subs
        });
    
        const organizationInstance = new Organization({
            userID: draft.organizer,
            eventID: eventInstance._id        });

        // Salva l'evento nel database
        eventInstance.save();
        organizationInstance.save();
        
        await Draft.findByIdAndDelete(id);
        res.json(draft);
    } catch (err) {
        res.status(500).send("Errore durante il recupero dei drafts");
    }
});


//elimina un dato evento con id
router.delete('/:id', authenticateJWT, async (req, res) => {
    try {
        //controlla che l'user id appartenga ad un admin
        const u = await User.findById(req.user.userId);
        if(!u.isAdmin){return res.status(403).json({ message: 'non sei un admin' });}
        const eventId = new mongoose.Types.ObjectId(req.query.id);

        const deletedEvent = await Draft.findByIdAndDelete(eventId);
        if (!deletedEvent) {
            return res.status(405).json({ message: 'Evento non trovato' });
        }
        res.json({ message: 'Evento eliminato con successo', deletedEvent });
    } catch (err) {
        res.status(500).json({ message: 'Errore del server', error: err.message });
    }
});


module.exports = router;
