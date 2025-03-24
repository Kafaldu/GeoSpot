import express from "express";
import User from "../models/user.model.js"; 

const router = express.Router();

router.post("/register", async (req, res) => {
  console.log("Received Registration Data:", req.body);
  const { email, username, uid } = req.body;

  if (!email || !username || !uid) {
    console.log("Missing fields in request.");
    return res.status(400).json({ message: "Missing required fields." });
  }

  try {
    let user = await User.findOne({ uid });

    if (!user) {
      user = new User({ email, username, uid });
      await user.save();
      console.log("User saved to MongoDB:", user);
    } else {
      console.log("User already exists:", user);
    }

    res.status(201).json(user);
  } catch (error) {
    console.error("Error saving user to MongoDB:", error);
    res.status(500).json({ message: "Error saving user", error });
  }
});

export default router;
