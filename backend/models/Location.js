import mongoose from 'mongoose';

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

const LocationModel = mongoose.model('Location', locationSchema);

export default LocationModel;
