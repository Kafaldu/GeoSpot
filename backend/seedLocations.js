
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import LocationModel from './models/Location.js'; 

dotenv.config();

await mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const locations = [
  {
    name: 'Plaza of the Americas',
    description: 'A central UF landmark with shady oak trees and hammocks.',
    coordinates: { lat: 29.6505, lng: -82.3429 },
    isActive: true,
  },
  {
    name: 'Century Tower',
    description: 'Iconic bell tower that chimes every quarter hour.',
    coordinates: { lat: 29.6491, lng: -82.3443 },
  },
  {
    name: 'Lake Alice',
    description: 'Peaceful lake with gators and a great sunset view.',
    coordinates: { lat: 29.6456, lng: -82.3542 },
  },
  {
    name: 'Reitz Union North Lawn',
    description: 'Open green space often used for tabling and events.',
    coordinates: { lat: 29.6462, lng: -82.3473 },
  },
];

try {
  await LocationModel.deleteMany(); // optional: clears previous data
  await LocationModel.insertMany(locations);
  console.log('✅ Seeded locations successfully');
} catch (err) {
  console.error('❌ Failed to seed locations:', err);
} finally {
  await mongoose.disconnect();
}
