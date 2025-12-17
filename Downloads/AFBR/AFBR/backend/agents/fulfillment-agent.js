// backend/agents/fulfillment-agent.js
import Order from '../models/Order.js';

/**
 * FulfillmentAgent
 * - Handles pickup, shipping, and reservation flows.[file:1][web:49]
 */
class FulfillmentAgent {
  constructor({ app }) {
    this.app = app;
  }

  async handle({ sessionId, userId, message }) {
    const type = this.detectType(message);
    const location = this.extractLocation(message) || 'Store-007';

    const order = await Order.findOne({ user: userId })
      .sort({ created_at: -1 })
      .lean();

    if (!order) {
      return {
        type: 'fulfillment',
        status: 'no_order',
        message: 'No recent order found for fulfillment.'
      };
    }

    let result;

    if (type === 'pickup') {
      result = await this.schedulePickup(order.order_id, location);
    } else if (type === 'ship') {
      result = await this.scheduleShipment(order.order_id);
    } else {
      result = await this.reserveForTryOn(order.order_id, location);
    }

    return {
      type: 'fulfillment',
      fulfillment_type: type,
      ...result
    };
  }

  detectType(message) {
    const lower = message.toLowerCase();
    if (lower.includes('ship') || lower.includes('deliver')) return 'ship';
    if (lower.includes('reserve')) return 'reserve';
    return 'pickup';
  }

  extractLocation(message) {
    const lower = message.toLowerCase();
    if (lower.includes('store-007')) return 'Store-007';
    if (lower.includes('store-001')) return 'Store-001';
    return null;
  }

  async schedulePickup(orderId, storeLocation) {
    const pickupDate = new Date();
    pickupDate.setHours(pickupDate.getHours() + 4);

    await Order.updateOne(
      { order_id: orderId },
      {
        $set: {
          'fulfillment.type': 'pickup',
          'fulfillment.location': storeLocation,
          'fulfillment.status': 'confirmed',
          'fulfillment.estimated_delivery': pickupDate
        }
      }
    );

    return {
      status: 'confirmed',
      order_id: orderId,
      pickup_date: pickupDate.toISOString(),
      location: storeLocation
    };
  }

  async scheduleShipment(orderId) {
    const estimatedDelivery = new Date();
    estimatedDelivery.setDate(estimatedDelivery.getDate() + 3);

    await Order.updateOne(
      { order_id: orderId },
      {
        $set: {
          'fulfillment.type': 'ship',
          'fulfillment.location': 'Home Address',
          'fulfillment.status': 'processing',
          'fulfillment.estimated_delivery': estimatedDelivery
        }
      }
    );

    return {
      status: 'processing',
      order_id: orderId,
      estimated_delivery: estimatedDelivery.toISOString()
    };
  }

  async reserveForTryOn(orderId, storeLocation) {
    const reservationExpiry = new Date();
    reservationExpiry.setHours(reservationExpiry.getHours() + 48);

    await Order.updateOne(
      { order_id: orderId },
      {
        $set: {
          'fulfillment.type': 'reserve',
          'fulfillment.location': storeLocation,
          'fulfillment.status': 'reserved',
          'fulfillment.estimated_delivery': reservationExpiry
        }
      }
    );

    return {
      status: 'reserved',
      order_id: orderId,
      expiry: reservationExpiry.toISOString(),
      location: storeLocation,
      message: 'Reserved for 48 hours. Visit the store to try on and complete purchase.'
    };
  }
}

export default FulfillmentAgent;
