// backend/agents/loyalty-offers-agent.js
import User from '../models/User.js';
import { Promotion } from '../models/Loyalty.js';
import Order from '../models/Order.js';

/**
 * LoyaltyOffersAgent
 * - Applies loyalty tier discounts and promotions to latest order.[file:1][web:53][web:59]
 */
class LoyaltyOffersAgent {
  constructor({ app }) {
    this.app = app;
  }

  async handle({ sessionId, userId, message }) {
    const user = await User.findById(userId).lean();
    if (!user) {
      return {
        type: 'loyalty',
        status: 'no_user',
        message: 'User not found for loyalty application.'
      };
    }

    const order = await Order.findOne({ user: userId }).sort({ created_at: -1 }).lean();
    if (!order) {
      return {
        type: 'loyalty',
        status: 'no_order',
        message: 'No recent order found for offers.'
      };
    }

    const result = await this.applyToOrder(user, order);

    await Order.updateOne(
      { order_id: order.order_id },
      {
        $set: {
          discount: result.discount,
          final_total: result.final_total
        }
      }
    );

    return {
      type: 'loyalty',
      orderId: order.order_id,
      ...result
    };
  }

  async applyToOrder(user, order) {
    const subtotal = order.subtotal;
    let discount = 0;
    const reasons = [];

    const tierDiscount = this.getTierDiscount(user.loyalty_tier);
    if (tierDiscount > 0) {
      const d = (subtotal * tierDiscount) / 100;
      discount += d;
      reasons.push(`${user.loyalty_tier} tier discount (${tierDiscount}%)`);
    }

    const now = new Date();
    const promo = await Promotion.findOne({
      applicable_tiers: user.loyalty_tier,
      active: true,
      start_date: { $lte: now },
      end_date: { $gte: now }
    }).lean();

    if (promo) {
      const d = (subtotal * promo.discount_percent) / 100;
      discount += d;
      reasons.push(promo.name);
    }

    const final_total = Math.max(0, subtotal - discount);

    return {
      subtotal,
      discount: Math.round(discount),
      discount_reason: reasons.join(', '),
      final_total: Math.round(final_total),
      savings: Math.round(discount)
    };
  }

  getTierDiscount(tier) {
    const map = {
      Bronze: 0,
      Silver: 5,
      Gold: 10,
      Platinum: 15
    };
    return map[tier] || 0;
  }
}

export default LoyaltyOffersAgent;
