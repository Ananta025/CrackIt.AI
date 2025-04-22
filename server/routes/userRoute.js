import * as userController from '../controllers/userController.js';
import { Router } from 'express';
import { body } from 'express-validator';



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












export default router;