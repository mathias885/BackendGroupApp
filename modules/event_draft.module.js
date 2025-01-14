const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const draftSchema = new Schema({
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
    target: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    max_subs: {
        type: Number,
        required: true
    },
    organizer:{
        type: String, 
        required: true
    }
});

const Draft = mongoose.model('drafts', draftSchema);
module.exports = Draft;
