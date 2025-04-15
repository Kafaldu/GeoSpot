import express from 'express';
import PostModel from '../models/post.model.js';
import UserModel from '../models/user.model.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/friends', authMiddleware, async (req, res) => {
  try {
    const currentUser = await UserModel.findById(req.user.id).populate('following');
    const followingIds = currentUser.following.map(friend => friend._id);
    const posts = await PostModel.find({ userId: { $in: friendIds } })
      .sort({ date: -1 })
      .limit(50);
    res.status(200).json(posts);
  } catch (error) {
    console.error('Error fetching friend feed:', error);
    res.status(500).json({ message: 'Server error' });
  }
});


router.get('/local', authMiddleware, async (req, res) => {
  try {
    const posts = await PostModel.find({})
      .sort({ date: -1 })
      .limit(50);
    res.status(200).json(posts);
  } catch (error) {
    console.error('Error fetching friend feed:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
