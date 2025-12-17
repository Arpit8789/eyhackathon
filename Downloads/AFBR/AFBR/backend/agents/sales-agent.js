// backend/agents/sales-agent.js
import { getContextManager } from '../services/context-manager.js';
import { getSessionManager } from '../services/session-manager.js';
import { getLLMClient } from '../config/langchain.js';
import { buildSystemPrompt } from '../utils/prompts.js';
import RecommendationAgent from './recommendation-agent.js';
import InventoryAgent from './inventory-agent.js';
import PaymentAgent from './payment-agent.js';
import FulfillmentAgent from './fulfillment-agent.js';
import LoyaltyOffersAgent from './loyalty-offers-agent.js';
import PostPurchaseAgent from './post-purchase-agent.js';

/**
 * SalesAgent
 * - Main orchestrator.
 * - Parses user message, routes to worker agents, composes structured response[file:1][web:96][web:93][web:87]
 */
class SalesAgent {
  constructor({ app }) {
    this.app = app;
    this.llm = getLLMClient();

    this.contextManager = getContextManager(app);
    this.sessionManager = getSessionManager(app);

    this.recommendationAgent = new RecommendationAgent({ app });
    this.inventoryAgent = new InventoryAgent({ app });
    this.paymentAgent = new PaymentAgent({ app });
    this.fulfillmentAgent = new FulfillmentAgent({ app });
    this.loyaltyOffersAgent = new LoyaltyOffersAgent({ app });
    this.postPurchaseAgent = new PostPurchaseAgent({ app });
  }

  /**
   * Simple rule-based intent detection + keywords.
   * Can be swapped to LLM-based later.[web:82][web:95]
   */
  detectIntent(message) {
    const text = (message || '').toLowerCase();

    if (text.includes('track') || text.includes('return') || text.includes('exchange')) {
      return 'post_purchase';
    }
    if (text.includes('pay') || text.includes('checkout') || text.includes('upi') || text.includes('card')) {
      return 'payment';
    }
    if (text.includes('pickup') || text.includes('reserve') || text.includes('delivery')) {
      return 'fulfillment';
    }
    if (text.includes('offer') || text.includes('discount') || text.includes('loyalty')) {
      return 'loyalty';
    }
    if (text.includes('stock') || text.includes('availability')) {
      return 'inventory';
    }

    // Default: product discovery/recommendation
    return 'recommendation';
  }

  /**
   * Process a chat message:
   * - Ensure session
   * - Get/update context
   * - Route to appropriate worker agents
   * - Store messages and return structured output[file:1][web:96][web:99]
   */
  async handleMessage({ app, sessionId, userId, channel = 'web', message }) {
    const io = app.get('io');

    // 1. Ensure session exists
    const sessionManager = this.sessionManager;
    let session = await sessionManager.createOrLoadSession({ sessionId, userId, channel });
    const effectiveSessionId = session.sessionId;

    // 2. Load context
    const contextManager = this.contextManager;
    const ctx = await contextManager.getContext(effectiveSessionId);

    // 3. Store user message
    await contextManager.storeMessage(effectiveSessionId, {
      role: 'user',
      content: message,
      intent: null
    });

    // 4. Determine intent
    const intent = this.detectIntent(message);

    // 5. Call appropriate worker agent(s)
    let agentResult = null;

    if (intent === 'recommendation') {
      agentResult = await this.recommendationAgent.handle({
        sessionId: effectiveSessionId,
        userId: session.userId,
        channel,
        message
      });
    } else if (intent === 'inventory') {
      agentResult = await this.inventoryAgent.handle({
        sessionId: effectiveSessionId,
        message
      });
    } else if (intent === 'payment') {
      agentResult = await this.paymentAgent.handle({
        sessionId: effectiveSessionId,
        userId: session.userId,
        message
      });
    } else if (intent === 'fulfillment') {
      agentResult = await this.fulfillmentAgent.handle({
        sessionId: effectiveSessionId,
        userId: session.userId,
        message
      });
    } else if (intent === 'loyalty') {
      agentResult = await this.loyaltyOffersAgent.handle({
        sessionId: effectiveSessionId,
        userId: session.userId,
        message
      });
    } else if (intent === 'post_purchase') {
      agentResult = await this.postPurchaseAgent.handle({
        sessionId: effectiveSessionId,
        userId: session.userId,
        message
      });
    }

    // 6. Compose natural language reply using (mock) LLM[web:34][web:31]
    const fullContext = await contextManager.getContext(effectiveSessionId);
    const systemPrompt = buildSystemPrompt(fullContext);
    const agentSummary = JSON.stringify(agentResult || {}, null, 2);

    const prompt = `
${systemPrompt}

User message:
${message}

Structured agent result:
${agentSummary}

Write a short, friendly response for chat UI that:
- Explains what was done (e.g., recommended products, checked inventory, applied offers, etc.).
- Mentions 1-2 key details.
- Ends with a next-step suggestion.
`.trim();

    const replyText = await this.llm.generateResponse(prompt);

    // 7. Store assistant message + update context focus
    await contextManager.storeMessage(effectiveSessionId, {
      role: 'assistant',
      content: replyText,
      intent
    });

    await contextManager.updateContext(effectiveSessionId, {
      current_focus: intent
    });

    // 8. Emit via Socket.io (if connected)
    if (io) {
      io.to(effectiveSessionId).emit('chat:message', {
        sessionId: effectiveSessionId,
        role: 'assistant',
        content: replyText,
        intent,
        agentResult
      });
    }

    // 9. Return structured response for REST API
    session = await sessionManager.getSession(effectiveSessionId);

    return {
      sessionId: effectiveSessionId,
      intent,
      reply: replyText,
      agentResult,
      channel: session.channel,
      userId: session.userId,
      timestamp: new Date().toISOString()
    };
  }
}

let salesAgentInstance = null;

export const getSalesAgent = (app) => {
  if (salesAgentInstance) return salesAgentInstance;
  salesAgentInstance = new SalesAgent({ app });
  return salesAgentInstance;
};

export default SalesAgent;
