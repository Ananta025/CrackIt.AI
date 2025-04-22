import { Router } from 'express';
import { analyzeResume } from '../controllers/resumeController.js';
import multer from 'multer';

const router = Router();

// Configure multer for memory storage (store as buffer)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept only PDF files
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'), false);
    }
  },
});

// Route for resume analysis
router.post('/analyze', upload.single('resume'), analyzeResume);

export default router;