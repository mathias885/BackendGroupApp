const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const partecipationSchema = new Schema({
    
    userID: {
        type: String,
        required: true
    },
    eventID: {
        type: Number,
        required: true
    }
});

const partecipation = mongoose.model('Partecipation', partecipationSchema);
module.exports = partecipation;
