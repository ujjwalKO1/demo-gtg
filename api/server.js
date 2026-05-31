import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import connectDB from './config/db.js';
import errorHandler from './middleware/errorHandler.js';

// Route files
import authRoutes from './routes/authRoutes.js';
import eventRoutes from './routes/eventRoutes.js';
import requestRoutes from './routes/requestRoutes.js';
import attendanceRoutes from './routes/attendanceRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import creditRoutes from './routes/creditRoutes.js';

dotenv.config();

// Connect to database
connectDB();

const app = express();

// Body parser
app.use(express.json());

// Enable CORS
app.use(cors({
  origin: '*', // Allow all origins for the MVP
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Mount routers
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/credits', creditRoutes);

// Simple health check API route
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'GTG API is running smoothly' });
});

// Serve frontend static assets in non-Vercel production environments
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

if (process.env.NODE_ENV === 'production' && !process.env.VERCEL) {
  app.use(express.static(path.join(projectRoot, 'dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(projectRoot, 'dist', 'index.html'));
  });
}

// Global Central Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// Do not start app.listen on Vercel (Vercel wraps Express as a serverless function)
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  });
}

export default app;
