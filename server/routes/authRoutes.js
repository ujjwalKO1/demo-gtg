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
import rateLimit from 'express-rate-limit';

const router = express.Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 requests per `window` (here, per 15 minutes)
  message: 'Too many authentication attempts from this IP, please try again after 15 minutes',
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.post('/google', authLimiter, googleLogin);
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.post('/verify', protect, verifyDigiLocker);
router.post('/firebase-verify', protect, verifyFirebasePhone);

export default router;
