// backend/models/Product.js
import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const ProductSchema = new Schema(
  {
    sku: { type: String, unique: true, required: true, index: true },
    name: { type: String, required: true },
    description: { type: String },
    category: { type: String, index: true },
    subcategory: { type: String },

    price: { type: Number, required: true },
    discount_percent: { type: Number, default: 0 },
    final_price: { type: Number },

    attributes: {
      size: [{ type: String }],
      color: [{ type: String }],
      material: { type: String },
      fit: { type: String }
    },

    images: [{ type: String }],
    rating: { type: Number, default: 0 },
    review_count: { type: Number, default: 0 },

    // Embeddings for semantic search (kept simple here)
    embedding: {
      type: [Number],
      select: false
    },

    tags: [{ type: String }],
    in_stock: { type: Boolean, default: true },

    created_at: { type: Date, default: Date.now }
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
  }
);

const Product = model('Product', ProductSchema);

export default Product;
