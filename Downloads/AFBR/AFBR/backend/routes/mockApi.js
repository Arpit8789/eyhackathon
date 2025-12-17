// backend/routes/mockApi.js
import express from 'express';

const router = express.Router();

/**
 * Mock external services:
 * - Inventory
 * - Payment gateway
 * - Loyalty / promotions
 * These are used by agents in later phases but can already be hit in Postman.[file:1]
 */

router.get('/inventory', async (req, res) => {
  const { sku = 'FS123', location = 'Store-007' } = req.query;

  return res.json({
    status: 'ok',
    data: {
      sku,
      location,
      available_stock: 12,
      status: 'in_stock',
      checkedAt: new Date().toISOString()
    }
  });
});

router.post('/payment/process', async (req, res) => {
  const { amount = 0, method = 'UPI' } = req.body || {};
  const success = Math.random() < 0.85;

  if (!amount || amount <= 0) {
    return res.status(400).json({
      status: 'error',
      message: 'Valid amount is required'
    });
  }

  if (!success) {
    return res.status(400).json({
      status: 'failed',
      reason: 'Payment declined by mock gateway'
    });
  }

  return res.json({
    status: 'success',
    txn_id: `TXN-${Date.now()}`,
    amount_charged: amount,
    method,
    timestamp: new Date().toISOString()
  });
});

router.get('/loyalty/:userId', async (req, res) => {
  const { userId } = req.params;

  return res.json({
    status: 'ok',
    data: {
      userId,
      tier: 'Gold',
      discount_percent: 10,
      points: 120
    }
  });
});

export default router;
