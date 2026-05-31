import express from 'express';
import {
  getEventAttendance,
  markAttendance
} from '../controllers/attendanceController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect); // Secure all attendance routes

router.route('/event/:eventId')
  .get(getEventAttendance)
  .post(markAttendance);

export default router;
