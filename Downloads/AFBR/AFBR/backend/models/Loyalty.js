// backend/models/Loyalty.js
import mongoose from 'mongoose';

const { Schema, model, Types } = mongoose;

const LoyaltyTierSchema = new Schema(
  {
    tier_name: {
      type: String,
      enum: ['Bronze', 'Silver', 'Gold', 'Platinum'],
      required: true,
      unique: true
    },
    min_points_required: { type: Number, required: true },
    discount_percent: { type: Number, default: 0 },
    perks: [{ type: String }]
  },
  {
    timestamps: true
  }
);

const PromotionSchema = new Schema(
  {
    name: { type: String, required: true },
    description: { type: String },
    discount_percent: { type: Number, default: 0 },
    applicable_tiers: [{ type: String, enum: ['Bronze', 'Silver', 'Gold', 'Platinum'] }],
    start_date: { type: Date, required: true },
    end_date: { type: Date, required: true },
    active: { type: Boolean, default: true }
  },
  {
    timestamps: true
  }
);

const LoyaltyTransactionSchema = new Schema(
  {
    user: { type: Types.ObjectId, ref: 'User', required: true },
    points_change: { type: Number, required: true },
    reason: { type: String },
    created_at: { type: Date, default: Date.now }
  },
  { _id: true }
);

const LoyaltyTier = model('LoyaltyTier', LoyaltyTierSchema);
const Promotion = model('Promotion', PromotionSchema);
const LoyaltyTransaction = model('LoyaltyTransaction', LoyaltyTransactionSchema);

export { LoyaltyTier, Promotion, LoyaltyTransaction };
