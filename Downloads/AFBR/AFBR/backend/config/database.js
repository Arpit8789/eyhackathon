// backend/config/database.js
import mongoose from 'mongoose';

const connectDatabase = async () => {
  const mongoUri = process.env.MONGODB_URI;

  if (!mongoUri) {
    console.error('❌ MONGODB_URI is not set in environment variables');
    process.exit(1);
  }

  mongoose.set('strictQuery', true);

  try {
    await mongoose.connect(mongoUri, {
      // options kept minimal for Mongoose 7+[web:22][web:32]
      autoIndex: true,
      serverSelectionTimeoutMS: 5000
    });

    console.log('✅ MongoDB connected');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    // Fail fast for demo: easier to notice config issues[web:24][web:26][web:35]
    process.exit(1);
  }

  // Connection events (helpful during dev)
  mongoose.connection.on('error', (err) => {
    console.error('MongoDB runtime error:', err);
  });

  mongoose.connection.on('disconnected', () => {
    console.warn('MongoDB disconnected');
  });
};

export default connectDatabase;
