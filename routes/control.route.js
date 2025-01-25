const express = require('express');
const router = express.Router();
const Draft = require('../modules/event_draft.module');
const Event = require('../modules/event.module');
const User = require('../modules/user.module');
const Organization = require('../modules/organizations.module');
const Partecipation = require('../modules/partecipation.module');
const mongoose = require('mongoose');
const authenticateJWT = require('../middlewares/authenticateJWT');
var ObjectId = require('mongodb').ObjectId;



//mostra le draft
router.get('/drafts',authenticateJWT,async (req, res) => {
    
    try {

        //controlla che l'user id appartenga ad un admin
        const u = await User.findById(req.user.userId);
        if(!u.isAdmin){return res.status(404).json({ message: 'non sei un admin' });}



        // Legge il parametro `start` dalla query string e lo converte in un numero
        const start = parseInt(req.query.start, 10) || 0; // Default: 0 se non specificato


        // Recupera i 100 eventi a partire dall'indice specificato saltando i primi "start"
        const results = await Draft.find().skip(start).limit(100);
        
        res.send(results);

    } catch (err) {
        res.status(500).send("Errore durante il recupero dei drafts");
    }
});



//approva un dato evento con id
router.post('/approve',authenticateJWT,async (req, res) => {
    
    try {
        //controlla che l'user id appartenga ad un admin
        const u = await User.findById(req.user.userId);
        if(!u.isAdmin){return res.status(404).json({ message: 'non sei un admin' });}

        const id=new ObjectId(req.body.id);
        const draft = await Draft.findById(id);
        console.log(draft);

        if (!draft) {
            return res.status(404).json({ message: 'draft non trovato' });
        }

        //crea l'evento
        const eventInstance = new Event({
            title: draft.title,
            date: draft.date,
            location: draft.location,
            price: draft.price,
            target: draft.target,
            category: draft.category,
            description: draft.description,
            max_subs: draft.max_subs
        });
    
        //crea "chi lo organizza"
        const organizationInstance = new Organization({
            userID: draft.organizer,
            eventID: eventInstance._id        
        });

        // Salva l'evento nel database
        eventInstance.save();
        organizationInstance.save();
        

        await Draft.findByIdAndDelete(id);


        res.json(draft);// serve??
    } catch (err) {
        res.status(500).send("Errore durante il recupero dei drafts");
    }
});


//elimina una draft con id
router.delete('/draft',authenticateJWT,async (req, res) => {
    try {

        //controlla che l'user id appartenga ad un admin
        const u = await User.findById(req.user.userId);
        if(!u.isAdmin){return res.status(403).json({ message: 'non sei un admin' });}

        const id=new ObjectId(req.query.id);
        const deletedEvent = await Draft.findByIdAndDelete(id);

        if (!deletedEvent) {
            return res.status(405).json({ message: 'Draft non trovata' });
        }
        
        res.json({ message: 'Draft eliminata con successo', deletedEvent });
    } catch (err) {
        res.status(500).json({ message: 'Errore del server', error: err.message });
    }
});

//elimina un evento con id
router.delete('/event',authenticateJWT,async (req, res) => {
    try {

        //controlla che l'user id appartenga ad un admin
        const u = await User.findById(req.user.userId);
        if(!u.isAdmin){return res.status(403).json({ message: 'non sei un admin' });}

        const id=new ObjectId(req.query.id);
        const deletedEvent = await Event.findByIdAndDelete(id);

        if (!deletedEvent) {
            return res.status(405).json({ message: 'Evento non trovato' });
        }
        
        const result = await Partecipation.deleteMany({ "eventID":id });
        if (!result) {
            return res.status(405).json({ message: 'nessuna parteciapzione trovata' });
        }

        res.json({ message: 'Evento eliminato con successo', deletedEvent });
    } catch (err) {
        res.status(500).json({ message: 'Errore del server', error: err.message });
    }
});

module.exports = router;
