import mongoose from "mongoose";
import User from "../models/user.model.js";

export const createUser = async (req, res) => {
    const user = req.body;

    if(!user.username || !user.email || !user.password) {
        return res.status(400).json({ message: "Please fill in all fields." });
    }

    const newUser = await User(user);

    try
    {
        await newUser.save();
        res.status(201).json({success: true, data: newUser});
    }
    catch(error) 
    {
        if(newUser.email === user.email) {
            return res.status(400).json({ message: "User already exists." });
        }
        else
        {
            res.status(500).json({ success: false, message: "Server Error" });
            console.error("Error in Create User: ", error.message);
        }
    }
}

export const getUser = async (req, res) => {
    const id = req.params.id;
    try{
        const user = await User.findById(id);
        res.status(200).json({ success: true, data: user });
    }
    catch(error) {
        res.status(404).json({ success: false, message: res.status(404).json({ success: false, message: `User not found: ${error.message}` })
    });
        console.error("Error in Get User: ", error.message);
    }
}

export const updateUser = async (req, res) => {
    const id = req.params.id;
    const user = req.body;

    try{
        const updatedUser = await User.findByIdAndUpdate(id, user, { new: true });
        res.status(200).json({ success: true, data: updatedUser });
    }
    catch(error) {
        res.status(404).json({ success: false, message: `User not found: ${error.message}` });
        console.error("Error in Update User: ", error.message);
    }
}

export const deleteUser = async (req, res) => {
    const id = req.params.id;
    try{
        await User.findByIdAndDelete(id);
        res.status(200).json({ success: true, message: "User deleted." });
    }
    catch(error) {
        res.status(404).json({ success: false, message: "User not found" });
        console.error("Error in Delete User: ", error.message);
    }
}