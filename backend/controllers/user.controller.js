import mongoose from "mongoose";
import User from "../models/user.model.js";

// Create a new user
export const createUser = async (req, res) => {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({ message: "Please fill in all fields." });
    }

    try {
        // Check if the user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists." });
        }

        // Create a new user
        const newUser = new User({
            username,
            email,
            password,
        });

        await newUser.save();
        res.status(201).json({ success: true, data: newUser });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server Error" });
        console.error("Error in Create User: ", error.message);
    }
};

// Get a user by ID
export const getUser = async (req, res) => {
    const id = req.params.id;
    try {
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found." });
        }
        res.status(200).json({ success: true, data: user });
    } catch (error) {
        res.status(404).json({ success: false, message: `Error finding user: ${error.message}` });
        console.error("Error in Get User: ", error.message);
    }
};

// Update a user
export const updateUser = async (req, res) => {
    const id = req.params.id;
    const user = req.body;

    try {
        // Find the user and update it
        const updatedUser = await User.findByIdAndUpdate(id, user, { new: true });
        if (!updatedUser) {
            return res.status(404).json({ success: false, message: "User not found." });
        }
        res.status(200).json({ success: true, data: updatedUser });
    } catch (error) {
        res.status(500).json({ success: false, message: `Error updating user: ${error.message}` });
        console.error("Error in Update User: ", error.message);
    }
};

// Delete a user
export const deleteUser = async (req, res) => {
    const id = req.params.id;
    try {
        const deletedUser = await User.findByIdAndDelete(id);
        if (!deletedUser) {
            return res.status(404).json({ success: false, message: "User not found." });
        }
        res.status(200).json({ success: true, message: "User deleted." });
    } catch (error) {
        res.status(500).json({ success: false, message: `Error deleting user: ${error.message}` });
        console.error("Error in Delete User: ", error.message);
    }
};
