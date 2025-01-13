const { type } = require('express/lib/response');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    mail:{
        type: String,
        required:true
    },
    userId:{
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

userSchema.methods.comparePassword = async function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);
module.exports = User;
