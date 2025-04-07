import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import UserModel from './models/user.model.js';
import dotenv from 'dotenv';
dotenv.config();
import { v4 as uuidv4 } from 'uuid';

const app = express();

app.use(express.json());
app.use(cors({
  origin: '*', 
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
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
        uid: uuidv4() 
      });
  
      res.json(newUser);
    } catch (err) {
      console.error("Error during signup:", err);
      res.status(500).json({ message: "Server error", error: err });
    }
  });
  

app.post('/login', (req, res) => {
  const { email, password } = req.body;
  UserModel.findOne({ email: email })
    .then(user => {
      if (user) {
        if (user.password === password) {
          res.json("Success");
        } else {
          res.json("Password incorrect");
        }
      } else {
        res.json("No record found");
      }
    });
});

app.post('/UserProfilePage', (req, res) => {
  const { email } = req.body;
  UserModel.findOne({ email: email })
    .then(user => {
      if (user) {
        res.json({ 
          username: user.username, 
          numPosts: user.numPosts,
          numFollowers: user.numFollowers,
          numFollowing: user.numFollowing,
          userLevel: user.userLevel,
          spotsVisited: user.spotsVisited,
          streak: user.streak,
          memberSince: user.memberSince,
        });
        
      } else {
        res.json("No user found with that email");
      }
    })
    .catch(err => res.json(err));
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

app.post('/follow', (req, res) => {
  const { currentUserId, targetUserId } = req.body;
  UserModel.findByIdAndUpdate(currentUserId, {
    $addToSet: { following: targetUserId }
  });
  UserModel.findByIdAndUpdate(targetUserId, {
    $addToSet: { followers: currentUserId }
  });
  res.json({ message: "Followed successfully" });
});

app.post('/unfollow', (req, res) => {
  const { currentUserId, targetUserId } = req.body;
  UserModel.findByIdAndUpdate(currentUserId, {
    $pull: { following: targetUserId }
  });
  UserModel.findByIdAndUpdate(targetUserId, {
    $pull: { followers: currentUserId }
  });
  res.json({ message: "Unfollowed successfully" });
});

app.get('/followers/:userId', (req, res) => {
  const user = UserModel.findById(req.params.userId).populate('followers', 'username email');
  res.json(user.followers);
});

app.get('/following/:userId', (req, res) => {
  const user = UserModel.findById(req.params.userId).populate('following', 'username email');
  res.json(user.following);
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
