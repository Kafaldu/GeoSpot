import UserModel from '../models/user.model.js';

export const getUserProfile = async (req, res) => {
  const { email } = req.body;
  
  try {
    const user = await UserModel.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ 
      username: user.username,
      profilePicture: user.profilePicture, 
      numPosts: user.numPosts,
      numFollowers: user.numFollowers,
      numFollowing: user.numFollowing,
      userLevel: user.userLevel,
      spotsVisited: user.spotsVisited,
      streak: user.streak,
      memberSince: user.memberSince,
      bio: user.bio,
      pet: user.pet,
      petLevel: user.petLevel,
      petName: user.petName,
      petCurrency: user.petCurrency
    });

  } catch (err) {
    console.error('Error in getUserProfile:', err);
    res.status(500).json({ message: "Server error", error: err });
  }
};
