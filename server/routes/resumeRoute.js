import express from 'express';
import multer from 'multer';
import { reviewResume } from '../controllers/resumeController.js';

const router = express.Router();

// Configure multer with memory storage
const storage = multer.memoryStorage();
const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: (req, file, cb) => {
        // Accept only PDF and DOCX files
        if (file.mimetype === 'application/pdf' || 
                file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
            cb(null, true);
        } else {
            cb(new Error('Only PDF and DOCX files are allowed'), false);
        }
    }
});

// Define route for resume review
router.post('/review', upload.single('resume'), reviewResume);

export default router;
