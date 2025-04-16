import express from 'express';
import LocationModel from '../models/Location.js';

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

export default router;
