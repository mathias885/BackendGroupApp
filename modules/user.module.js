const { type } = require('express/lib/response');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    mail:{
        type: String,
        required:true
    },
    password:{
        type: String,
        required: true
    },
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

userSchema.methods.comparePassword = function(plainPassword) {
    // Compara le password come stringhe (no hashing)
    return this.password === plainPassword;
};

const User = mongoose.model('events', userSchema);
module.exports = User;
