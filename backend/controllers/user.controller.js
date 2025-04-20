const UserModel = require('../models/user.model');

const getUserProfile = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await UserModel.findOne({ email });

    if (!user) return res.status(404).json({ message: "User not found" });

    const populatedFollowers = await Promise.all(
      (user.followers || []).map(async (follower) => {
        if (follower.username) return follower;
        const fullUser = await UserModel.findOne({ uid: follower.uid });
        return fullUser ? {
          uid: fullUser.uid,
          email: fullUser.email,
          username: fullUser.username
        } : follower;
      })
    );

    const populatedFollowing = await Promise.all(
      (user.following || []).map(async (followed) => {
        if (followed.username) return followed;
        const fullUser = await UserModel.findOne({ uid: followed.uid });
        return fullUser ? {
          uid: fullUser.uid,
          email: fullUser.email,
          username: fullUser.username
        } : followed;
      })
    );

    const enrichedUser = {
      ...user.toObject(),
      followers: populatedFollowers,
      following: populatedFollowing,
    };

    res.json(enrichedUser);
  } catch (err) {
    console.error("Error in getUserProfile:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

module.exports = { getUserProfile };
