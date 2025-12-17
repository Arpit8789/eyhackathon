// backend/agents/payment-agent.js
import Order from '../models/Order.js';
import { sleep } from '../utils/helpers.js';

/**
 * PaymentAgent
 * - Mock payment processing with retry logic.[file:1][web:88]
 */
class PaymentAgent {
  constructor({ app }) {
    this.app = app;
  }

  async handle({ sessionId, userId, message }) {
    const method = this.detectMethod(message);
    const order = await Order.findOne({ 'payment.status': 'pending', user: userId })
      .sort({ created_at: -1 })
      .lean();

    if (!order) {
      return {
        type: 'payment',
        status: 'no_order',
        message: 'No pending order found to pay for.'
      };
    }

    const payload = {
      orderId: order.order_id,
      amount: order.final_total,
      method
    };

    const result = await this.processPayment(payload);

    return {
      type: 'payment',
      orderId: order.order_id,
      method,
      ...result
    };
  }

  detectMethod(message) {
    const lower = message.toLowerCase();
    if (lower.includes('upi')) return 'UPI';
    if (lower.includes('card')) return 'card';
    if (lower.includes('gift')) return 'gift_card';
    return 'UPI';
  }

  async processPayment({ orderId, amount, method }) {
    let attempts = 0;
    const maxAttempts = 3;

    while (attempts < maxAttempts) {
      attempts += 1;

      const success = Math.random() < 0.85;
      if (success) {
        await Order.updateOne(
          { order_id: orderId },
          {
            $set: {
              'payment.status': 'success',
              'payment.method': method,
              'payment.transaction_id': `TXN-${Date.now()}`
            }
          }
        );

        return {
          status: 'success',
          transaction_id: `TXN-${Date.now()}`,
          amount_charged: amount,
          attempts
        };
      }

      if (attempts < maxAttempts) {
        await sleep(500 * attempts);
      }
    }

    await Order.updateOne(
      { order_id: orderId },
      {
        $set: {
          'payment.status': 'failed',
          'payment.method': method
        }
      }
    );

    return {
      status: 'failed',
      reason: 'Max retries exceeded or payment declined'
    };
  }
}

export default PaymentAgent;
