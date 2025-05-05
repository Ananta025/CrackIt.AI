import * as userController from '../controllers/userController.js';
import { Router } from 'express';
import { body } from 'express-validator';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = Router();

router.post(
    "/register",
    body("email").isEmail().withMessage("Please provide a valid email"),
    body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters long"),
    userController.registerUser
);
router.post(
    "/login",
    body("email").isEmail().withMessage("Please provide a valid email"),
    body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters long"),
    userController.loginUser
);
router.get("/get-user-details/:id", userController.getUserDetails);
router.put("/update-skills/:id", userController.updateUserSkills);
router.put(
    "/update-name/:id", 
    authMiddleware.authenticateUser, 
    userController.updateUserName
);
router.put(
    "/update-password/:id",
    authMiddleware.authenticateUser,
    body("newPassword").isLength({ min: 6 }).withMessage("Password must be at least 6 characters long"),
    userController.updateUserPassword
);

export default router;