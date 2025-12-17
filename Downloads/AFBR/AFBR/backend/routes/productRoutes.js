// backend/routes/productRoutes.js
import express from 'express';
import Product from '../models/Product.js';

const router = express.Router();

/**
 * GET /api/products
 * Query params:
 *  - q: search text
 *  - category
 *  - maxPrice
 */
router.get('/', async (req, res, next) => {
  try {
    const { q, category, maxPrice } = req.query;
    const filter = {};

    if (category) {
      filter.category = new RegExp(category, 'i');
    }
    if (maxPrice) {
      const n = Number(maxPrice);
      if (!Number.isNaN(n)) {
        filter.price = { $lte: n };
      }
    }
    if (q) {
      const regex = new RegExp(q, 'i');
      filter.$or = [{ name: regex }, { description: regex }, { tags: regex }];
    }

    const products = await Product.find(filter).limit(30).lean();

    return res.json({
      status: 'ok',
      data: products
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/products/:sku
 */
router.get('/:sku', async (req, res, next) => {
  try {
    const { sku } = req.params;
    const product = await Product.findOne({ sku }).lean();

    if (!product) {
      return res.status(404).json({
        status: 'error',
        message: 'Product not found'
      });
    }

    return res.json({
      status: 'ok',
      data: product
    });
  } catch (err) {
    next(err);
  }
});

export default router;
