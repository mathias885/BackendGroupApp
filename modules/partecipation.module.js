const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const eventSchema = new Schema({
    
    userID: {
        type: Number,
        required: true
    },
    eventID: {
        type: Number,
        required: true
    }
});

const partecipation = mongoose.model('events', eventSchema);
module.exports = partecipation;
