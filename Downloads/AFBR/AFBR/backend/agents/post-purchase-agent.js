// backend/agents/post-purchase-agent.js
import Order from '../models/Order.js';

/**
 * PostPurchaseAgent
 * - Handles returns, exchanges, tracking, feedback (simplified).[file:1][web:97]
 */
class PostPurchaseAgent {
  constructor({ app }) {
    this.app = app;
  }

  async handle({ sessionId, userId, message }) {
    const type = this.detectQueryType(message);

    const order = await Order.findOne({ user: userId })
      .sort({ created_at: -1 })
      .lean();

    if (!order) {
      return {
        type: 'post_purchase',
        status: 'no_order',
        message: 'No recent order found to support.'
      };
    }

    if (type === 'tracking') {
      return this.trackShipment(order);
    }

    if (type === 'return') {
      return this.initiateReturn(order);
    }

    if (type === 'exchange') {
      return this.initiateExchange(order);
    }

    return this.collectFeedback(order, message);
  }

  detectQueryType(message) {
    const lower = message.toLowerCase();
    if (lower.includes('track')) return 'tracking';
    if (lower.includes('return')) return 'return';
    if (lower.includes('exchange')) return 'exchange';
    if (lower.includes('feedback') || lower.includes('review')) return 'feedback';
    return 'feedback';
  }

  async trackShipment(order) {
    return {
      type: 'post_purchase',
      status: 'tracking',
      order_id: order.order_id,
      current_status: 'in_transit',
      last_update: new Date().toISOString(),
      estimated_delivery: order.fulfillment?.estimated_delivery || null
    };
  }

  async initiateReturn(order) {
    return {
      type: 'post_purchase',
      status: 'return_initiated',
      order_id: order.order_id,
      refund_amount: order.final_total,
      next_steps: 'Pack the product and visit your nearest store within 14 days.'
    };
  }

  async initiateExchange(order) {
    return {
      type: 'post_purchase',
      status: 'exchange_initiated',
      order_id: order.order_id,
      message: 'Exchange request created. Please visit your nearest store with the product and invoice.'
    };
  }

  async collectFeedback(order, feedbackText) {
    return {
      type: 'post_purchase',
      status: 'feedback_recorded',
      order_id: order.order_id,
      message: 'Thank you for your feedback! You have earned 50 loyalty points.',
      feedback: feedbackText
    };
  }
}

export default PostPurchaseAgent;
