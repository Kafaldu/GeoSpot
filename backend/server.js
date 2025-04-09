import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import UserModel from './models/user.model.js';
import dotenv from 'dotenv';
dotenv.config();
import { v4 as uuidv4 } from 'uuid';
import cloudinary from './cloudinary.js';

const app = express();

app.use(express.json({ limit: '10mb' }));

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
  

app.post('/UserProfilePage', (req, res) => {
  const { email } = req.body;
  UserModel.findOne({ email: email })
    .then(user => {
      if (user) {
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
        
      } else {
        res.json("No user found with that email");
      }
    })
    .catch(err => res.json(err));
});

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
