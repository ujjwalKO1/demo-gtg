import express from 'express';
import {
  register,
  login,
  getProfile,
  updateProfile,
  verifyDigiLocker,
  verifyFirebasePhone,
  googleLogin
} from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/google', googleLogin);
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.post('/verify', protect, verifyDigiLocker);
router.post('/firebase-verify', protect, verifyFirebasePhone);

export default router;
