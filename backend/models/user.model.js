import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid'; // Import uuid package for unique user ids

const userSchema = new mongoose.Schema(
  {
    uid: {
      type: String,
      required: true,
      unique: true,
      default: () => uuidv4() // Automatically generate a uid if not provided
    },
    username: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true,
      unique: true
    },
    password: {
      type: String,
      required: true
    }
  },
  {
    timestamps: true
  }
);

// Create the model based on the schema
const User = mongoose.model('User', userSchema);

export default User;
