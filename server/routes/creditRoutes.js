import express from 'express';
import {
  getTransactions
} from '../controllers/creditController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect); // Secure all credit endpoints

router.get('/transactions', getTransactions);

export default router;
