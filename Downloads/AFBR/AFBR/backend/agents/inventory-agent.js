// backend/agents/inventory-agent.js
import Inventory from '../models/Inventory.js';

/**
 * InventoryAgent
 * - Checks availability for SKUs at specific locations.[file:1][web:49]
 */
class InventoryAgent {
  constructor({ app }) {
    this.app = app;
  }

  async handle({ sessionId, message }) {
    const skus = this.extractSkus(message);
    const location = this.extractLocation(message) || 'Store-007';

    const inventory = await Promise.all(
      skus.map(async (sku) => {
        const record = await Inventory.findOne({ sku, location }).lean();
        const available = record?.available_stock || 0;
        return {
          sku,
          location,
          available,
          status: available > 0 ? 'in_stock' : 'out_of_stock'
        };
      })
    );

    return {
      type: 'inventory',
      location,
      inventory,
      timestamp: new Date().toISOString()
    };
  }

  extractSkus(message) {
    const matches = message.match(/[A-Z]{2}\d{3}/g);
    if (matches && matches.length) return matches;
    return ['FS123', 'FS456'];
  }

  extractLocation(message) {
    const lower = message.toLowerCase();
    if (lower.includes('store-007')) return 'Store-007';
    if (lower.includes('store-001')) return 'Store-001';
    return null;
  }
}

export default InventoryAgent;
