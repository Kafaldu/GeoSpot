import express from "express";
import dotenv from "dotenv";
import path from "path";
import { connectDB } from "./config/db.js";
import loginRoutes from "./routes/login.route.js";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use("/api/login",loginRoutes);

app.listen(PORT, () => 
{    
  connectDB();
  console.log(`Server started at http://localhost:${PORT}`);
});
