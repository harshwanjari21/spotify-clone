const express = require('express');
const router = express.Router();
const Song = require('../models/Song');

// Get all songs
router.get('/', async (req, res) => {
    try {
        const songs = await Song.find();
        res.json(songs);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get songs by category
router.get('/category/:category', async (req, res) => {
    try {
        const songs = await Song.find({ category: req.params.category });
        res.json(songs);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get songs by folder
router.get('/folder/:folder', async (req, res) => {
    try {
        const songs = await Song.find({ folder: req.params.folder });
        res.json(songs);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router; 