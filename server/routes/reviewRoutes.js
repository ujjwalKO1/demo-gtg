import express from 'express';
import {
  submitReview,
  getOrganizerReviews
} from '../controllers/reviewController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/', protect, submitReview);
router.get('/organizer/:userId', getOrganizerReviews);

export default router;
