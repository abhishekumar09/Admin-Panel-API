import express from 'express';
import {
  login,
  signup,
  registerUser,
} from '../controllers/authController';
import authMiddleware from '../middleware/authMiddleware';
import {
  loginValidation,
  signupValidation,
  registerUserValidation,
} from '../validation/authValidation'; // Adjust the import path

const router = express.Router();

router.post('/login', loginValidation, login);
router.post('/signup', signupValidation, signup);
router.post('/register', authMiddleware(['ADMIN']), registerUserValidation, registerUser);

export default router;
