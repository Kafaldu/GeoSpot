const express = require('express');
const LocationModel = require('../models/Location');

const router = express.Router();

// GET all locations
router.get('/', async (req, res) => {
  try {
    const locations = await LocationModel.find({});
    res.status(200).json(locations);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch locations' });
  }
});

module.exports = router;