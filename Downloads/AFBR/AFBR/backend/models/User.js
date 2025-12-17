// backend/models/User.js
import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const AddressSchema = new Schema(
  {
    label: { type: String, default: 'Home' },
    line1: { type: String, required: true },
    line2: { type: String },
    city: { type: String },
    state: { type: String },
    pincode: { type: String },
    country: { type: String, default: 'India' },
    phone: { type: String },
    is_default: { type: Boolean, default: false }
  },
  { _id: false }
);

const PreferencesSchema = new Schema(
  {
    favorite_categories: [{ type: String }],
    size: { type: String },
    color_preferences: [{ type: String }]
  },
  { _id: false }
);

const UserSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    phone: { type: String },
    password_hash: { type: String },

    age: { type: Number },
    gender: { type: String, enum: ['male', 'female', 'other'], default: 'other' },

    loyalty_tier: {
      type: String,
      enum: ['Bronze', 'Silver', 'Gold', 'Platinum'],
      default: 'Bronze'
    },
    loyalty_points: { type: Number, default: 0 },
    preferred_store_location: { type: String },
    device_preferences: [{ type: String }],

    purchase_history: [{ type: String }], // SKUs
    browsing_history: [{ type: String }], // SKUs
    preferences: PreferencesSchema,

    addresses: [AddressSchema],

    created_at: { type: Date, default: Date.now },
    last_login: { type: Date },
    is_active: { type: Boolean, default: true }
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
  }
);

const User = model('User', UserSchema);

export default User;
