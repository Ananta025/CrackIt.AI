import express from 'express';
import {optimizePost} from '../controllers/postController.js';
import { validatePostData } from '../middlewares/validator.js'; // Import the validation middleware

const router = express.Router();

// Route to optimize LinkedIn post content
router.post('/optimize', validatePostData,optimizePost);

export default router;