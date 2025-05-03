import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/database.js';
import userRoutes from './routes/userRoute.js';
import resumeRoute from './routes/resumeRoute.js';
import linkedinRoute from './routes/linkedinRoute.js';
import interviewRoute from './routes/interviewRoute.js';
import learnQuizRoute from './routes/learnQuizRoute.js';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import mongoose from 'mongoose';
import { fileURLToPath } from 'url';
import path from 'path';
import { seedTemplates } from './utils/seedTemplates.js';
import fs from 'fs';

// Configure environment variables
dotenv.config();

// Create Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Start server function
const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();
    
    app.use(session({
      secret: process.env.SESSION_SECRET || 'crackit-fallback-secret',
      resave: false,
      saveUninitialized: false,
      store: MongoStore.create({
        mongoUrl: process.env.MONGODB_URI || mongoose.connection._connectionString,
        collectionName: 'sessions',
        ttl: 24 * 60 * 60
      }),
      cookie: { 
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000 
      }
    }));
    
    // Seed resume templates if needed
    await seedTemplates();
    
    // API routes
    app.use('/api/user', userRoutes);
    app.use('/api/resume', resumeRoute);
    app.use('/api/linkedin', linkedinRoute);
    app.use('/api/interview', interviewRoute);
    app.use('/api/learn', learnQuizRoute);

    // Health check endpoint
    app.get('/', (req, res) => {
      res.status(200).json({
        status: 'success',
        message: 'CrackIt.AI API server is running',
        environment: process.env.NODE_ENV || 'development',
        timestamp: new Date().toISOString()
      });
    });

    // Serve static files if in production
    if (process.env.NODE_ENV === 'production') {
      const __dirname = path.dirname(fileURLToPath(import.meta.url));
      const clientDistPath = path.join(__dirname, '../client/dist');
      
      // Check if the client dist directory exists
      try {
        if (fs.existsSync(clientDistPath)) {
          app.use(express.static(clientDistPath));
          
          app.get('*', (req, res) => {
            res.sendFile(path.join(clientDistPath, 'index.html'));
          });
        } else {
          console.log('Client build folder not found. API-only mode.');
        }
      } catch (err) {
        console.error('Error checking client build folder:', err);
      }
    }
    
    // Error handling middleware
    app.use((err, req, res, next) => {
      console.error(err.stack);
      res.status(500).json({ 
        success: false,
        message: 'Server error',
        error: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message
      });
    });
    
    // Start listening
    const server = app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();