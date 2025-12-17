// backend/agents/recommendation-agent.js
import Product from '../models/Product.js';
import User from '../models/User.js';
import { buildRecommendationPrompt } from '../utils/prompts.js';
import { getLLMClient } from '../config/langchain.js';
import { getContextManager } from '../services/context-manager.js';

/**
 * RecommendationAgent
 * - Suggests products based on user query and simple filters.
 * - Uses MongoDB products + optional user profile.[file:1][web:44][web:57]
 */
class RecommendationAgent {
  constructor({ app }) {
    this.app = app;
    this.llm = getLLMClient();
    this.contextManager = getContextManager(app);
  }

  async handle({ sessionId, userId, channel, message }) {
    const ctx = await this.contextManager.getContext(sessionId);

    const filters = {};
    const lower = message.toLowerCase();
    if (lower.includes('formal')) filters.category = /formal/i;
    if (lower.includes('shirt')) filters.category = /shirt/i;
    if (lower.includes('under 2000') || lower.includes('< 2000')) filters.price = { $lte: 2000 };

    let user = null;
    if (userId) {
      user = await User.findById(userId).lean();
    }

    const query = {};
    if (filters.category) query.category = filters.category;
    if (filters.price) query.price = filters.price;

    const products = await Product.find(query).limit(10).lean();

    const prompt = buildRecommendationPrompt({
      query: message,
      context: ctx
    });

    const llmComment = await this.llm.generateResponse(prompt);

    const recommendations = products.slice(0, 5).map((p) => ({
      sku: p.sku,
      name: p.name,
      price: p.price,
      category: p.category,
      image_url: p.images?.[0] || null,
      reason: 'Matched your query and preferences'
    }));

    await this.contextManager.updateContext(sessionId, {
      selected_products: recommendations.map((r) => r.sku),
      last_recommendation_comment: llmComment
    });

    return {
      type: 'recommendation',
      recommendations,
      comment: llmComment,
      user_profile_used: !!user
    };
  }
}

export default RecommendationAgent;
