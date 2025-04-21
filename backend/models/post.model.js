const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  username: { type: String, required: true },
  userProfilePicture: { type: String },
  text: { type: String, required: true },
  date: { type: Date, default: Date.now }
});

const postSchema = new mongoose.Schema({
  userId: { type: String, required: true }, 
  username: { type: String, required: true },
  imageUrl: { type: String, required: true },
  description: { type: String },
  date: { type: Date, default: Date.now },
  location: { type: String },
  userProfilePicture: { type: String },
  likes: [{ type: String }], // Array of userIds who liked the post
  comments: [commentSchema]
});

module.exports = mongoose.model('Post', postSchema);