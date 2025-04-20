const mongoose = require('mongoose');

const locationSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },                
  description: { type: String },                         
  coordinates: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
  },
  imagePrompt: { type: String },                         
  isActive: { type: Boolean, default: false },          
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Location', locationSchema);