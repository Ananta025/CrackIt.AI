import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();
import userRoute from './routes/userRoute.js';
import connectDB from './config/database.js';
import resumeRoute from './routes/resumeRoute.js';
import interviewRoute from './routes/interviewRoute.js';
import { cookie } from 'express-validator';
import linkedinRoute from './routes/linkedinRoute.js';
import authMiddleware from './middlewares/authMiddlwware.js';
import learnQuizRoute from './routes/learnQuizRoute.js';
import session from 'express-session';

const app = express();
const PORT = process.env.PORT;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookie());

// Add session middleware for quiz state management
app.use(session({
  secret: process.env.SESSION_SECRET || 'learn-quiz-session-secret',
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: process.env.NODE_ENV === 'production',
    maxAge: 30 * 60 * 1000 // 30 minutes
  }
}));

app.get("/",(req,res)=>{
    res.send("Server is running");
})

app.use("/api/user", userRoute);
app.use("/api/resume", resumeRoute);
app.use("/api/interview", interviewRoute);
app.use("/api/linkedin", linkedinRoute);

// Use learn and quiz routes
app.use('/api/learn', learnQuizRoute);

// Error handling middleware
app.use(authMiddleware.AIError);

connectDB()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    })
    .catch((err) => console.log(err));