import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
    username: { type: String },
    email: { type: String, required: true, unique: true },
    password: { type: String },
    uid: { type: String, required: true, unique: true }  // ✨ ADD THIS
});

const UserModel = mongoose.model("users", UserSchema);

export default UserModel;
