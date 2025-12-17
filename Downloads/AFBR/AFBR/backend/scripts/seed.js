// backend/scripts/seed.js
import dotenv from 'dotenv';
import connectDatabase from '../config/database.js';
import { seedAll } from '../data/mockData.js';

dotenv.config();

const run = async () => {
  try {
    await connectDatabase();
    const user = await seedAll();
    console.log('✅ Seed complete.');
    console.log('Demo user:', {
      id: user._id.toString(),
      email: user.email,
      loyalty_tier: user.loyalty_tier,
      loyalty_points: user.loyalty_points
    });
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed error:', err);
    process.exit(1);
  }
};

run();
