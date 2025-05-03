import { Router } from 'express';
import { 
  analyzeResume,
  getResumeTemplates,
  generateSection,
  saveResume,
  generatePDF,
  getUserResumes
} from '../controllers/resumeController.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import multer from 'multer';
import config from '../config/config.js';

const router = Router();

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: config.resume.maxFileSize, // Use from config
  },
  fileFilter: (req, file, cb) => {
    // Accept configured file types
    if (config.resume.allowedFileTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Unsupported file type. Allowed types: PDF, DOCX, and plain text.'), false);
    }
  },
});

// Public routes
router.post('/analyze', upload.single('resume'), analyzeResume);
router.get('/templates', getResumeTemplates);
router.post('/generate-section', generateSection);

// Protected routes
router.use(authMiddleware.authenticateUser);
router.post('/save', saveResume);
router.get('/download/:resumeId', generatePDF);
router.get('/user', getUserResumes);

export default router;