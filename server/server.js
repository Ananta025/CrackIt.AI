import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();
import userRoute from './routes/userRoute.js';
import connectDB from './config/database.js';
import resumeRoute from './routes/resumeRoute.js';
import interviewRoute from './routes/interviewRoute.js';
import { cookie } from 'express-validator';

const app = express();
const PORT = process.env.PORT;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookie());

app.get("/",(req,res)=>{
    res.send("Server is running");
})

app.use("/api/user", userRoute);
app.use("/api/resume", resumeRoute);
app.use("/api/interview", interviewRoute);






connectDB()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    })
    .catch((err) => console.log(err));