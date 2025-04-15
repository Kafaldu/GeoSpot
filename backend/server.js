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

const app = express();

app.use(express.json({ limit: '10mb' }));
app.use('/api/feed', feedRoutes);
app.use('/api/users/search', userRoutes);

app.use(cors({
  origin: '*', 
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type'],
}));

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
    const newPost = await PostModel.create({
      userId,
      username,
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
    const user = await UserModel.findById(req.params.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const following = user.following || [];
    const followers = user.followers || [];

    // Find mutual followers
    const mutuals = following.filter(id => followers.includes(id));

    // Find posts by mutuals
    const posts = await PostModel.find({ userId: { $in: mutuals } }).sort({ date: -1 });

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
    await UserModel.findByIdAndUpdate(currentUserId, {
      $addToSet: { following: targetUserId }
    });

    await UserModel.findByIdAndUpdate(targetUserId, {
      $addToSet: { followers: currentUserId }
    });

    res.json({ message: "Followed successfully" });
  } catch (err) {
    console.error('Error following user:', err);
    res.status(500).json({ message: "Server error", error: err });
  }
});


app.post('/unfollow', async (req, res) => {
  const { currentUserId, targetUserId } = req.body;

  try {
    await UserModel.findByIdAndUpdate(currentUserId, {
      $pull: { following: targetUserId }
    });

    await UserModel.findByIdAndUpdate(targetUserId, {
      $pull: { followers: currentUserId }
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



app.get('/followers/:userId', async (req, res) => {
  try {
    const user = await UserModel.findById(req.params.userId).populate('followers', 'username email');
    res.json(user.followers);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err });
  }
});


app.get('/following/:userId', async (req, res) => {
  try {
    const user = await UserModel.findById(req.params.userId).populate('following', 'username email');
    res.json(user.following);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err });
  }
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
