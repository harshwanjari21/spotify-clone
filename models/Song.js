const mongoose = require('mongoose');

const songSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    artist: {
        type: String,
        required: true
    },
    folder: {
        type: String,
        required: true
    },
    coverImage: {
        type: String,
        required: true
    },
    audioFile: {
        type: String,
        required: true
    },
    duration: {
        type: Number,
        default: 0
    },
    category: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Song', songSchema); 