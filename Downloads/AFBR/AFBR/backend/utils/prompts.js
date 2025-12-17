// backend/utils/prompts.js

/**
 * Prompt templates for the Sales Agent or LLM service.
 * Even with mock LLM, these help structure responses.
 */

export const buildSystemPrompt = (context) => {
  const userId = context?.userId || 'guest';
  const channel = context?.channel || 'web';

  return `
You are an AI-powered omnichannel sales assistant for a fashion retail brand.
User ID: ${userId}
Channel: ${channel}

Your goals:
- Help user discover products (formal shirts, casual wear, etc.).
- Use available context: cart items, selected products, past messages.
- Guide them through inventory, payment, and fulfillment steps.
- Keep responses concise and conversational for chat UI.
`.trim();
};

export const buildRecommendationPrompt = ({ query, context }) => {
  const lastMessages =
    context?.messages?.slice(-3).map((m) => `${m.role}: ${m.content}`).join('\n') || '';

  return `
User query: ${query}

Recent conversation:
${lastMessages}

Task:
- Understand what the user is looking for (category, price, style).
- Suggest 3-5 suitable products from the catalog.
- Mention if they are good for office, party, or casual settings.
`.trim();
};
