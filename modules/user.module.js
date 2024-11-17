const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const eventSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    dateOfBirth: {
        type: Date,
        required: true
    },
    surname: {
        type: String,
        required: true
    },
    telephone: {
        type: Number,
        required: true
    }
});

const User = mongoose.model('events', eventSchema);
module.exports = User;
