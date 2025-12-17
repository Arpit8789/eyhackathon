// backend/services/context-manager.js
import Conversation from '../models/Conversation.js';
import { getSessionManager } from './session-manager.js';

/**
 * ContextManager
 * - Manages conversation history & cart/context
 * - Ensures continuity across channels and page reloads[file:1][web:68][web:71]
 */
class ContextManager {
  constructor({ app }) {
    this.app = app;
    this.sessionManager = getSessionManager(app);
  }

  async getContext(sessionId) {
    if (!sessionId) return null;

    const convo = await Conversation.findOne({ session_id: sessionId }).lean();
    if (!convo) return null;

    return {
      sessionId,
      userId: convo.user ? String(convo.user) : null,
      channel: convo.channel,
      context: convo.context || {},
      messages: convo.messages || [],
      lastActivity: convo.last_activity || convo.updated_at || convo.created_at
    };
  }

  async updateContext(sessionId, partialContext = {}) {
    const convo = await Conversation.findOne({ session_id: sessionId });
    if (!convo) {
      throw new Error(`Conversation not found for session: ${sessionId}`);
    }

    convo.context = {
      ...(convo.context || {}),
      ...partialContext
    };
    convo.last_activity = new Date();

    await convo.save();

    await this.sessionManager.updateSession(sessionId, { lastActivity: convo.last_activity.toISOString() });

    return convo.context;
  }

  async storeMessage(sessionId, { role, content, intent = null }) {
    const update = {
      $push: {
        messages: {
          role,
          content,
          intent,
          timestamp: new Date()
        }
      },
      $set: {
        last_activity: new Date()
      }
    };

    const convo = await Conversation.findOneAndUpdate(
      { session_id: sessionId },
      update,
      { new: true }
    );

    if (!convo) {
      throw new Error(`Conversation not found for storeMessage: ${sessionId}`);
    }

    await this.sessionManager.updateSession(sessionId, {
      lastActivity: convo.last_activity.toISOString()
    });

    return convo;
  }

  /**
   * Channel switching: keep same session, only update channel metadata
   */
  async switchChannel(sessionId, newChannel) {
    await this.sessionManager.switchChannel(sessionId, newChannel);

    await Conversation.updateOne(
      { session_id: sessionId },
      {
        $set: {
          channel: newChannel,
          last_activity: new Date()
        }
      }
    );

    return this.getContext(sessionId);
  }

  /**
   * Helper: get recent N messages (for short-term memory, e.g. for agents)
   */
  async getRecentMessages(sessionId, limit = 10) {
    const convo = await Conversation.findOne({ session_id: sessionId }).lean();
    if (!convo || !Array.isArray(convo.messages)) return [];

    return convo.messages.slice(-limit);
  }
}

let contextManagerInstance = null;

export const getContextManager = (app) => {
  if (contextManagerInstance) return contextManagerInstance;
  contextManagerInstance = new ContextManager({ app });
  return contextManagerInstance;
};

export default ContextManager;
