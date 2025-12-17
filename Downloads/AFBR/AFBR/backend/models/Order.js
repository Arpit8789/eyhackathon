// backend/models/Order.js
import mongoose from 'mongoose';

const { Schema, model, Types } = mongoose;

const OrderItemSchema = new Schema(
  {
    product: { type: Types.ObjectId, ref: 'Product', required: true },
    sku: { type: String, required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
    subtotal: { type: Number, required: true }
  },
  { _id: false }
);

const PaymentSchema = new Schema(
  {
    method: { type: String, enum: ['UPI', 'card', 'gift_card', 'cod'], default: 'UPI' },
    status: {
      type: String,
      enum: ['pending', 'success', 'failed'],
      default: 'pending'
    },
    transaction_id: { type: String },
    meta: { type: Schema.Types.Mixed }
  },
  { _id: false }
);

const FulfillmentSchema = new Schema(
  {
    type: { type: String, enum: ['ship', 'pickup', 'reserve'], default: 'pickup' },
    location: { type: String },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'reserved'],
      default: 'pending'
    },
    estimated_delivery: { type: Date }
  },
  { _id: false }
);

const OrderSchema = new Schema(
  {
    order_id: { type: String, unique: true, required: true, index: true },
    user: { type: Types.ObjectId, ref: 'User', required: true },

    items: { type: [OrderItemSchema], required: true },

    subtotal: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    loyalty_points_used: { type: Number, default: 0 },
    final_total: { type: Number, required: true },

    payment: PaymentSchema,
    fulfillment: FulfillmentSchema,

    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date }
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
  }
);

const Order = model('Order', OrderSchema);

export default Order;
