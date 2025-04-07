import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
    username: { type: String },
    email: { type: String, required: true, unique: true },
    password: { type: String },
    uid: { type: String, required: true, unique: true },
    userLevel: { type: Number, default: 0},
    memberSince: { type: Date, default: Date.now },
    numPosts: { type: Number, default: 0 },
    numFollowers: { type: Number, default: 0 },
    numFollowing: { type: Number, default: 0 },
    spotsVisited: { type: Number, default: 0 },
    streak: { type: Number, default: 0 },
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'users'}],
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'users'}],
});

const UserModel = mongoose.model("users", UserSchema);

export default UserModel;
