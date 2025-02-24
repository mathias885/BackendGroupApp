const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const messageSchema = new Schema({
    text: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    type: {
        type: String,
        required: true
    },
    to:{
        type: Schema.Types.ObjectId, 
        required: true
    }
});

const Message = mongoose.model('message', messageSchema);
module.exports = Message;
