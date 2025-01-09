const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const eventSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    location: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    creator: { type: mongoose.Schema.Types.ObjectId,
        ref: 'User', 
        required: true 
    } // Campo per l'utente creatore
});

const Event = mongoose.model('events', eventSchema);
module.exports = Event;
