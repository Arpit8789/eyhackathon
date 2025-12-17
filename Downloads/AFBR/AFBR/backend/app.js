// backend/app.js
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import createError from 'http-errors';
import dotenv from 'dotenv';

import connectDatabase from './config/database.js';
import redisClient from './config/redis.js';  // ← FIXED: direct import

// (Phase 5 will plug these in)
import chatRoutes from './routes/chatRoutes.js';
import productRoutes from './routes/productRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import userRoutes from './routes/userRoutes.js';
import mockApiRoutes from './routes/mockApi.js';

dotenv.config();

// Initialize Express app
const app = express();

// Connect MongoDB
await connectDatabase();

// Connect Redis (with in-memory fallback)  // ← FIXED: direct connect
await redisClient.connect().catch(() => {
  console.log('⚠️  Redis unavailable - continuing with mock');
});
app.set('redisClient', redisClient);

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    env: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString()
  });
});

// API routes (implemented in later phases but wired now)
app.use('/api/chat', chatRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/users', userRoutes);
app.use('/api/mock', mockApiRoutes);

// 404 handler
app.use((req, res, next) => {
  next(createError(404, 'Route not found'));
});

// Error handler
app.use((err, req, res, next) => {
  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';

  if (process.env.NODE_ENV !== 'test') {
    console.error('Error:', status, message);
    if (err.stack) {
      console.error(err.stack);
    }
  }

  res.status(status).json({
    status: 'error',
    message
  });
});

export default app;
