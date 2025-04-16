import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import UserModel from './models/user.model.js';
import PostModel from './models/post.model.js';
import dotenv from 'dotenv';
dotenv.config();
import { v4 as uuidv4 } from 'uuid';
import cloudinary from './cloudinary.js';
import feedRoutes from './routes/feed.routes.js';
import userRoutes from './routes/user.routes.js';
import { getUserProfile } from './controllers/user.controller.js';
import jwt from 'jsonwebtoken';
import locationsRouter from './routes/locations.js';

const app = express();

app.use(cors({
  origin: '*', 
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'], 
}));

app.use(express.json({ limit: '10mb' }));
app.use('/api/feed', feedRoutes);
app.use('/api/users/search', userRoutes);
app.use('/api/locations', locationsRouter);




mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB connection error:', err));

  app.post('/signup', async (req, res) => {
    try {
      const { username, email, password } = req.body;
      const existingUser = await UserModel.findOne({ email });
  
      if (existingUser) {
        return res.status(400).json({ message: "Email already registered" });
      }
  
      const newUser = await UserModel.create({ 
        username, 
        email, 
        password, 
        uid: uuidv4(),
        profilePicture:"https://res.cloudinary.com/dbmpdoet6/image/upload/v1744226231/jxz9tcyulimodvceq47f.png",
        userLevel: 0,          
        spotsVisited: 0,
        streak: 0,
        numPosts: 0,
        numFollowers: 0,
        numFollowing: 0,
        memberSince: new Date(), 
      });
  
      res.json(newUser);
    } catch (err) {
      console.error("Error during signup:", err);
      res.status(500).json({ message: "Server error", error: err });
    }
  });

  app.post('/savePet', async (req, res) => {
    const { email, selectedPet } = req.body;
  
    try {
      const user = await UserModel.findOneAndUpdate(
        { email },
        { 
          pet: selectedPet,
          petLevel: 1,            
          petName: "",       
          petCurrency: 0          
        },
        { new: true }
      );
  
      if (user) {
        res.json({ message: "Pet saved successfully", user });
      } else {
        res.status(404).json({ message: "User not found" });
      }
    } catch (err) {
      console.error('Error in /savePet:', err);
      res.status(500).json({ message: "Server error", error: err });
    }
  });
  
  

  app.post('/login', (req, res) => {
    const { email, password } = req.body;
    UserModel.findOne({ email: email })
      .then(user => {
        if (user) {
          if (user.password === password) {
            res.json({
              message: "Success",
              user: {
                username: user.username,
                email: user.email,
                uid: user.uid
              }
            });
          } else {
            res.json({ message: "Password incorrect" });
          }
        } else {
          res.json({ message: "No record found" });
        }
      })
      .catch(err => {
        res.status(500).json({ message: "Server error", error: err });
      });
  });
  
app.post('/UserProfilePage', getUserProfile);

app.post('/updatePetName', async (req, res) => {
  const { email, petName } = req.body;
  try {
    const user = await UserModel.findOneAndUpdate(
      { email },
      { petName: petName },
      { new: true }
    );
    if (user) {
      res.json({ message: "Pet name updated", user });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err });
  }
});

app.post('/createPost', async (req, res) => {
  const { userId, username, imageUrl, description, location } = req.body;

  try {
    const user = await UserModel.findOne({ uid: userId }); 
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const newPost = await PostModel.create({
      userId,
      username,
      userProfilePicture: user.profilePicture, 
      imageUrl,
      description,
      location,
    });

    res.json(newPost);
  } catch (err) {
    console.error('Error creating post:', err);
    res.status(500).json({ message: "Server error", error: err });
  }
});


app.get('/friendsFeed/:userId', async (req, res) => {
  try {
    const user = await UserModel.findOne({ uid: req.params.userId });
    if (!user) return res.status(404).json({ message: "User not found" });

    const following = user.following || [];
    const followers = user.followers || [];

    const mutualUids = following
      .map(f => typeof f === 'string' ? f : f.uid)
      .filter(uid => followers.some(f => (typeof f === 'string' ? f : f.uid) === uid));

    const posts = await PostModel.find({ userId: { $in: mutualUids } }).sort({ date: -1 });

    res.json(posts);
  } catch (err) {
    console.error('Error fetching friends feed:', err);
    res.status(500).json({ message: "Server error", error: err });
  }
});


app.get('/localFeed/:location', async (req, res) => {
  try {
    const location = req.params.location;

    const posts = await PostModel.find({ location }).sort({ date: -1 });

    res.json(posts);
  } catch (err) {
    console.error('Error fetching local feed:', err);
    res.status(500).json({ message: "Server error", error: err });
  }
});

app.get('/user/:email', (req, res) => {
  const { email } = req.params;
  UserModel.findOne({ email: email })
    .then(user => {
      if (user) {
        res.json(user); 
      } else {
        res.status(404).json({ message: "User not found" });
      }
    })
    .catch(err => res.status(500).json({ message: "Server error", error: err }));
});

app.post('/follow', async (req, res) => {
  const { currentUserId, targetUserId } = req.body;

  try {
    const currentUser = await UserModel.findOne({ uid: currentUserId });
    const targetUser = await UserModel.findOne({ uid: targetUserId });

    if (!currentUser || !targetUser) {
      return res.status(404).json({ message: "User(s) not found" });
    }

    // Build follow objects
    const currentUserInfo = {
      uid: currentUser.uid,
      username: currentUser.username,
      email: currentUser.email,
    };

    const targetUserInfo = {
      uid: targetUser.uid,
      username: targetUser.username,
      email: targetUser.email,
    };

    // Add to following / followers
    await UserModel.updateOne(
      { uid: currentUserId },
      { $addToSet: { following: targetUserInfo } }
    );

    await UserModel.updateOne(
      { uid: targetUserId },
      { $addToSet: { followers: currentUserInfo } }
    );

    // Update counts
    const updatedCurrent = await UserModel.findOne({ uid: currentUserId });
    const updatedTarget = await UserModel.findOne({ uid: targetUserId });

    updatedCurrent.numFollowing = updatedCurrent.following.length;
    updatedTarget.numFollowers = updatedTarget.followers.length;

    await updatedCurrent.save();
    await updatedTarget.save();

    res.json({ message: "Followed successfully" });
  } catch (err) {
    console.error('Error in /follow:', err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});





app.post('/unfollow', async (req, res) => {
  const { currentUserId, targetUserId } = req.body;

  try {
    await UserModel.findOneAndUpdate(
      { uid: currentUserId },
      { $pull: { following: { uid: targetUserId } } }
    );

    await UserModel.findOneAndUpdate(
      { uid: targetUserId },
      { $pull: { followers: { uid: currentUserId } } }
    );

    const updatedCurrentUser = await UserModel.findOne({ uid: currentUserId });
    const updatedTargetUser = await UserModel.findOne({ uid: targetUserId });

    await UserModel.findOneAndUpdate({ uid: currentUserId }, {
      numFollowing: updatedCurrentUser.following.length
    });

    await UserModel.findOneAndUpdate({ uid: targetUserId }, {
      numFollowers: updatedTargetUser.followers.length
    });

    res.json({ message: "Unfollowed successfully" });
  } catch (err) {
    console.error('Error unfollowing user:', err);
    res.status(500).json({ message: "Server error", error: err });
  }
});




app.post('/updateProfilePicture', async (req, res) => {
  const { email, image } = req.body;

  console.log('/updateProfilePicture endpoint hit');
  console.log('Received email:', email);
  console.log('Received image (first 100 chars):', image ? image.substring(0, 100) : 'No image');

  try {
    const uploadResponse = await cloudinary.uploader.upload(image, {
      upload_preset: 'ml_default',
    });

    console.log('Successfully uploaded to Cloudinary:', uploadResponse.secure_url);

    const user = await UserModel.findOneAndUpdate(
      { email },
      { profilePicture: uploadResponse.secure_url },
      { new: true }
    );

    if (user) {
      console.log('Updated user in MongoDB');
      res.json({ message: "Profile picture updated", user });
    } else {
      console.log('User not found');
      res.status(404).json({ message: "User not found" });
    }
  } catch (err) {
    console.error('Error in /updateProfilePicture:', err);  
    res.status(500).json({ message: "Server error", error: err });
  }
});

app.post('/updateProfile', async (req, res) => {
  const { email, username, bio } = req.body;

  try {
    const user = await UserModel.findOneAndUpdate(
      { email },
      { username, bio },
      { new: true }
    );

    if (user) {
      res.json({ message: "Profile updated successfully", user });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err });
  }
});

app.post('/search', async (req, res) => {
  const { username, currentUserId } = req.body;

  try {
    if (!username || !currentUserId) {
      return res.status(400).json({ error: "Missing username or currentUserId" });
    }

    const results = await UserModel.find({
      username: { $regex: username, $options: 'i' },
      uid: { $ne: currentUserId }, 
    });

    const currentUser = await UserModel.findOne({ uid: currentUserId });
    if (!currentUser) {
      return res.status(404).json({ error: 'Current user not found' });
    }

    const followingSet = new Set((currentUser.following || []).map(f => f.uid || f));

    const annotatedResults = results.map(user => ({
      uid: user.uid,
      username: user.username,
      email: user.email,
      isFollowing: followingSet.has(user.uid),
    }));

    res.json(annotatedResults);
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: 'Search failed' });
  }
});





app.get('/followers/:userId', async (req, res) => {
  try {
    const user = await UserModel.findOne({ uid: req.params.userId });
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json(user.followers); 
  } catch (err) {
    console.error('Error fetching followers:', err);
    res.status(500).json({ message: "Server error", error: err });
  }
});




app.get('/following/:userId', async (req, res) => {
  try {
    const user = await UserModel.findOne({ uid: req.params.userId });
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json(user.following);
  } catch (err) {
    console.error('Error fetching following:', err);
    res.status(500).json({ message: "Server error", error: err });
  }
});

app.get('/getCurrentUserEmail', (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'No token provided' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    res.json({ email: decoded.email, uid: decoded.uid });
  } catch (error) {
    console.error("Error decoding token:", error);
    res.status(500).json({ message: "Failed to decode token", error: error.message });
  }
});




app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
