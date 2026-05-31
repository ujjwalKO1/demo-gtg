import express from 'express';
import {
  submitRequest,
  getEventRequests,
  updateRequestStatus
} from '../controllers/requestController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect); // Secure all requests routes

router.route('/')
  .post(submitRequest);

router.route('/event/:eventId')
  .get(getEventRequests);

router.route('/:id')
  .put(updateRequestStatus);

export default router;
