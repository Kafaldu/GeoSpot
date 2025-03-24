import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import UserModel from './models/user.model.js';

const app = express();

app.use(express.json());
app.use(cors());

mongoose.connect("mongodb+srv://kafaldu2005:gxUIRmvgppJ3qv5A@cluster0.rlis2.mongodb.net/GeoSpot?")
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB connection error:', err));

app.post('/signup', (req, res) => {
  UserModel.create(req.body)
    .then(users => res.json(users))
    .catch(err => res.json(err));
});

app.post("/login", (req,res) => 
{
  const {email, password} = req.body;
  UserModel.findOne({email: email})
  .then(user => 
  {
    if(user)
    {
      if(user.password === password)
      {
        res.json("Success")
      }
      else
      {
        res.json("Password incorrect")
      }
    }
    else{
      res.json("No record found")
    }
  })
})

app.post("/home", (req, res) => {
  const { email } = req.body;
  UserModel.findOne({ email: email })
    .then(user => {
      if (user) {
        res.json({ username: user.username }); 
      } else {
        res.json("No user found with that email");
      }
    })
    .catch(err => res.json(err));
});


app.listen(3000, () => {
  console.log("Server is running on port 3000");
  console.log("Check out http://localhost:5173/signup")
});
