import mongoose from 'mongoose'

const UserSchema = new mongoose.Schema
({
    username: String,
    email: String,
    password: String
})

const UserModel = mongoose.model("users", UserSchema)

export default UserModel;