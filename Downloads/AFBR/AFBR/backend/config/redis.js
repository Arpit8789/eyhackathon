// backend/config/redis.js
import { createClient } from 'redis';

const createRedisClient = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
});

// Graceful error handling - don't crash if Redis is unavailable
createRedisClient.on('error', (err) => {
  console.warn('⚠️  Redis not available (optional for demo):', err.message);
});

createRedisClient.on('connect', () => {
  console.log('✅ Redis connected');
});

// Try to connect, but don't wait for it
createRedisClient.connect().catch(err => {
  console.warn('⚠️  Redis connection failed - continuing without cache');
});

export default createRedisClient;
