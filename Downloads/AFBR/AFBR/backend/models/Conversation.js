// backend/models/Conversation.js
import mongoose from 'mongoose';

const { Schema, model, Types } = mongoose;

const MessageSchema = new Schema(
  {
    role: { type: String, enum: ['user', 'assistant', 'system'], required: true },
    content: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    intent: { type: String }
  },
  { _id: false }
);

const CartItemSchema = new Schema(
  {
    sku: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true }
  },
  { _id: false }
);

const ContextSchema = new Schema(
  {
    current_focus: { type: String },
    selected_products: [{ type: String }],
    cart: [CartItemSchema],
    metadata: { type: Schema.Types.Mixed }
  },
  { _id: false }
);

const ConversationSchema = new Schema(
  {
    session_id: { type: String, unique: true, required: true, index: true },
    user: { type: Types.ObjectId, ref: 'User' },
    channel: { type: String, enum: ['web', 'app', 'whatsapp', 'telegram', 'kiosk'], default: 'web' },

    messages: [MessageSchema],
    context: ContextSchema,

    created_at: { type: Date, default: Date.now },
    last_activity: { type: Date, default: Date.now },
    expires_at: {
      type: Date,
      default: () => new Date(Date.now() + 24 * 60 * 60 * 1000) // 24h
    }
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
  }
);

ConversationSchema.index({ expires_at: 1 }, { expireAfterSeconds: 0 });

const Conversation = model('Conversation', ConversationSchema);

export default Conversation;
