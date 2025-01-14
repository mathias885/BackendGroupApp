const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const recordSchema = new Schema({
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
    subs: {
        type: Number,
        required:true
    },
    orgnizer:{
        type: Schema.Types.ObjectId, 
        required: true
    }
});

const Record = mongoose.model('records', recordSchema);
module.exports = Record;
