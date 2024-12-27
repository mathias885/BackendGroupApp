const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const partecipationSchema = new Schema({
    
    userID: {
        type: Schema.Types.ObjectId, 
        required: true
    },
    eventID: {
        type: Schema.Types.ObjectId, 
        required: true
    }
});

const partecipation = mongoose.model('Partecipation', partecipationSchema);
module.exports = partecipation;
