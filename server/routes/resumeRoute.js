    import { Router } from 'express';
    import { 
      analyzeResume,
      getResumeTemplates, // This one is from ResumeTemplateController, but its name matches
      generateSection,
      saveResume,
      generatePDF,
      getUserResumes
    } from '../controllers/resumeController.js'; // All imported from here
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

    // Public routes (no authMiddleware)
    router.post('/analyze', upload.single('resume'), analyzeResume);
    router.get('/templates', getResumeTemplates); // This route is actually handled by ResumeTemplateController
    router.post('/generate-section', generateSection);

    // Protected routes (require authMiddleware)
    router.use(authMiddleware.authenticateUser); // All routes below this line will use this middleware
    router.post('/save', saveResume);
    router.get('/download/:resumeId', generatePDF);
    router.get('/user', getUserResumes);

    export default router;
    