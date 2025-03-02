import express from "express";
import dotenv from "dotenv";
import path from "path";
import { connectDB } from "./config/db.js";
import userRoutes from "./routes/user.route.js";
import cors from "cors";

dotenv.config();

const app = express();
const PORT = process.env.PORT;

const __dirname = path.resolve();

app.use(express.json()); 
app.use(cors());
app.use("/api/users", userRoutes);

if (process.env.NODE_ENV === "production") {
    app.use('/assets', express.static(path.join(__dirname, 'frontend', 'dist', 'assets'), {
        setHeaders: (res, path) => {
            if (path.endsWith('.js')) {
                res.set('Content-Type', 'application/javascript');
            }
        }
    }));
    
    app.get("*", (req, res) => {
        res.sendFile(path.resolve(__dirname, "frontend", "dist", "index.html"));
    });
}

app.listen(PORT, () => {
    connectDB();
    console.log(`Server started at http://localhost:${PORT}`);
});
