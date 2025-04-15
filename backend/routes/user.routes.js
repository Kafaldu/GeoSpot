import express from "express";
import User from "../models/user.model.js";

const router = express.Router();

router.post("/search", async (req, res) => {
  const { username } = req.body;

  try {
    const users = await User.find({
      username: { $regex: username, $options: "i" },
    }).limit(10);

    res.json(users);
  } catch (error) {
    console.error("Error searching for users:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (error) {
    console.error("Error fetching user by ID:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// etc...

export default router;
