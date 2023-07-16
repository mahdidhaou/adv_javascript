'use strict';
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const sessionSchema = new mongoose.Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    accessToken: String,
    refreshToken: String,
}, { versionKey: false })

const Session = mongoose.model('Session', sessionSchema)

module.exports = Session;