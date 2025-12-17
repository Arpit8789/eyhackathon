// backend/utils/validators.js

/**
 * Very small validation helpers for demo.
 * You can swap this to Joi or Zod later if needed.
 */

export const validateChatMessage = (payload) => {
  const errors = [];

  if (!payload || typeof payload !== 'object') {
    errors.push('Payload must be an object');
    return errors;
  }

  if (!payload.message || typeof payload.message !== 'string') {
    errors.push('message is required and must be a string');
  }

  if (payload.channel && !['web', 'app', 'whatsapp', 'telegram', 'kiosk'].includes(payload.channel)) {
    errors.push('channel is invalid');
  }

  return errors;
};

export const validateOrderPayload = (payload) => {
  const errors = [];

  if (!payload.userId) errors.push('userId is required');

  if (!Array.isArray(payload.items) || payload.items.length === 0) {
    errors.push('items must be a non-empty array');
  }

  return errors;
};
