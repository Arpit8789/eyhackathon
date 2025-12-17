// backend/routes/userRoutes.js
import express from 'express';

const router = express.Router();

/**
 * Simple in-memory user profile store for Phase 1.
 * Later phases will use MongoDB User model and auth.
 */
const users = new Map();

router.post('/register', async (req, res) => {
  const { name, email } = req.body || {};

  if (!name || !email) {
    return res.status(400).json({
      status: 'error',
      message: 'name and email are required'
    });
  }

  const id = `USR-${Date.now()}`;
  const user = {
    id,
    name,
    email,
    loyaltyTier: 'Gold',
    loyaltyPoints: 120
  };

  users.set(id, user);

  return res.status(201).json({
    status: 'ok',
    data: user
  });
});

router.get('/:userId', async (req, res) => {
  const { userId } = req.params;
  const user = users.get(userId);

  if (!user) {
    return res.status(404).json({
      status: 'error',
      message: 'User not found'
    });
  }

  return res.json({
    status: 'ok',
    data: user
  });
});

export default router;
