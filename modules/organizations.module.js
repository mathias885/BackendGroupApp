const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const organizationSchema = new Schema({
    
    userID: {
        type: Schema.Types.ObjectId, 
        required: true
    },
    eventID: {
        type: Schema.Types.ObjectId, 
        required: true
    }
});

const Organization = mongoose.model('Organizations', organizationSchema);
module.exports = Organization;
