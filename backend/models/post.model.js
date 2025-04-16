import mongoose from 'mongoose';

const postSchema = new mongoose.Schema({
  userId: { type: String, required: true }, 
  username: { type: String, required: true },
  imageUrl: { type: String, required: true },
  description: { type: String },
  date: { type: Date, default: Date.now },
  location: { type: String },
  userProfilePicture: { type: String },
});

const PostModel = mongoose.model('Post', postSchema);

export default PostModel;