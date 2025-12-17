// backend/utils/helpers.js

/**
 * Generate a simple unique ID with prefix.
 */
export const generateId = (prefix = '') => {
  return `${prefix}${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

/**
 * Safely parse number with default.
 */
export const toNumber = (value, defaultValue = 0) => {
  const n = Number(value);
  // eslint-disable-next-line no-restricted-globals
  return isNaN(n) ? defaultValue : n;
};

/**
 * Calculate subtotal from order items.
 */
export const calculateSubtotal = (items = []) => {
  return items.reduce((sum, item) => sum + (item.subtotal || item.price * item.quantity || 0), 0);
};

/**
 * Sleep helper for retry logic.
 */
export const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
