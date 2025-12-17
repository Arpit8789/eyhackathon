// backend/routes/orderRoutes.js
import express from 'express';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import User from '../models/User.js';
import { calculateSubtotal, generateId } from '../utils/helpers.js';

const router = express.Router();

/**
 * POST /api/orders
 * Body: { userId, items: [{ sku, quantity }], fulfillmentType? }
 */
router.post('/', async (req, res, next) => {
  try {
    const { userId, items = [], fulfillmentType = 'pickup' } = req.body || {};

    if (!userId || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'userId and at least one item are required'
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(400).json({
        status: 'error',
        message: 'User not found'
      });
    }

    const skuList = items.map((i) => i.sku);
    const products = await Product.find({ sku: { $in: skuList } }).lean();

    const orderItems = items.map((item) => {
      const product = products.find((p) => p.sku === item.sku);
      if (!product) {
        throw new Error(`Product not found for SKU ${item.sku}`);
      }

      const price = product.final_price || product.price;
      const quantity = item.quantity || 1;
      const subtotal = price * quantity;

      return {
        product: product._id,
        sku: product.sku,
        name: product.name,
        price,
        quantity,
        subtotal
      };
    });

    const subtotal = calculateSubtotal(orderItems);
    const orderId = generateId('ORD-');

    const order = await Order.create({
      order_id: orderId,
      user: user._id,
      items: orderItems,
      subtotal,
      discount: 0,
      loyalty_points_used: 0,
      final_total: subtotal,
      payment: {
        method: 'UPI',
        status: 'pending'
      },
      fulfillment: {
        type: fulfillmentType,
        status: 'pending',
        location: 'Store-007'
      }
    });

    return res.status(201).json({
      status: 'ok',
      data: order
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/orders/:orderId
 */
router.get('/:orderId', async (req, res, next) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findOne({ order_id: orderId })
      .populate('user', 'name email loyalty_tier')
      .populate('items.product', 'sku name price')
      .lean();

    if (!order) {
      return res.status(404).json({
        status: 'error',
        message: 'Order not found'
      });
    }

    return res.json({
      status: 'ok',
      data: order
    });
  } catch (err) {
    next(err);
  }
});

export default router;
