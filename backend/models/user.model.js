const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    username: { type: String },
    email: { type: String, required: true, unique: true },
    password: { type: String },
    uid: { type: String, required: true, unique: true },
    profilePicture: {
        type: String,
        default: "https://res.cloudinary.com/dbmpdoet6/image/upload/v1744226231/jxz9tcyulimodvceq47f.png"
    },
    bio: { type: String, default: "" },
    userLevel: { type: Number, default: 1 },
    memberSince: { type: Date, default: Date.now },
    numPosts: { type: Number, default: 0 },
    numFollowers: { type: Number, default: 0 },
    numFollowing: { type: Number, default: 0 },
    spotsVisited: { type: Number, default: 0 },
    streak: { type: Number, default: 0 },
    pet: { type: String, default: null },
    petLevel: { type: Number, default: 1 },
    petName: { type: String, default: "No Name" },
    petCurrency: { type: Number, default: 0 },
    followers: [
        {
            uid: String,
            username: String,
            email: String,
        }
    ],
    following: [
        {
            uid: String,
            username: String,
            email: String,
        }
    ],
    photos: {
        type: [String],
        default: [],
      },
      
});

module.exports = mongoose.model("User", UserSchema);
