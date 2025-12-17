// backend/models/Inventory.js
import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const InventorySchema = new Schema(
  {
    sku: { type: String, required: true, index: true },
    location: { type: String, required: true }, // e.g., 'Store-007', 'Warehouse-01'
    available_stock: { type: Number, default: 0 },
    reserved_stock: { type: Number, default: 0 },

    warehouse_location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        default: [0, 0]
      }
    },

    updated_at: { type: Date, default: Date.now }
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
  }
);

InventorySchema.index({ warehouse_location: '2dsphere' });

const Inventory = model('Inventory', InventorySchema);

export default Inventory;
