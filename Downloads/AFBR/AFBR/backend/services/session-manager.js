// backend/services/session-manager.js
import Conversation from '../models/Conversation.js';
import User from '../models/User.js';

/**
 * SessionManager
 * - Short-term: Redis (fast context lookup)
 * - Long-term: MongoDB Conversation collection
 * - Omnichannel: sessionId shared across channels so state moves with user[file:1][web:65][web:68]
 */
class SessionManager {
  constructor({ redisClient }) {
    this.redis = redisClient;
    this.SESSION_TTL_SECONDS = 24 * 60 * 60; // 24h
  }

  _redisKey(sessionId) {
    return `session:${sessionId}`;
  }

  async createOrLoadSession({ sessionId, userId, channel = 'web' }) {
    if (sessionId) {
      const existing = await this.getSession(sessionId);
      if (existing) return existing;
    }

    const newSessionId = sessionId || `sess-${Date.now()}-${Math.random().toString(16).slice(2)}`;

    const sessionData = {
      sessionId: newSessionId,
      userId: userId || null,
      channel,
      createdAt: new Date().toISOString(),
      lastActivity: new Date().toISOString()
    };

    await this.redis.set(this._redisKey(newSessionId), JSON.stringify(sessionData), {
      EX: this.SESSION_TTL_SECONDS
    });

    await Conversation.create({
      session_id: newSessionId,
      user: userId || null,
      channel,
      messages: [],
      context: {},
      last_activity: new Date()
    });

    return sessionData;
  }

  async getSession(sessionId) {
    if (!sessionId) return null;

    const raw = await this.redis.get(this._redisKey(sessionId));
    if (raw) {
      return JSON.parse(raw);
    }

    const convo = await Conversation.findOne({ session_id: sessionId }).lean();
    if (!convo) return null;

    const sessionData = {
      sessionId,
      userId: convo.user ? String(convo.user) : null,
      channel: convo.channel,
      createdAt: convo.created_at?.toISOString?.() || new Date().toISOString(),
      lastActivity: convo.last_activity?.toISOString?.() || new Date().toISOString()
    };

    await this.redis.set(this._redisKey(sessionId), JSON.stringify(sessionData), {
      EX: this.SESSION_TTL_SECONDS
    });

    return sessionData;
  }

  async updateSession(sessionId, updates = {}) {
    const session = await this.getSession(sessionId);
    if (!session) return null;

    const merged = {
      ...session,
      ...updates,
      lastActivity: new Date().toISOString()
    };

    await this.redis.set(this._redisKey(sessionId), JSON.stringify(merged), {
      EX: this.SESSION_TTL_SECONDS
    });

    await Conversation.updateOne(
      { session_id: sessionId },
      {
        $set: {
          channel: updates.channel || session.channel,
          last_activity: new Date()
        }
      }
    );

    return merged;
  }

  /**
   * Switch channel without losing context:
   * - Redis entry updated with new channel
   * - Mongo Conversation channel updated
   */
  async switchChannel(sessionId, newChannel) {
    return this.updateSession(sessionId, { channel: newChannel });
  }

  async attachUser(sessionId, userId) {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found for attachUser');
    }

    const updatedSession = await this.updateSession(sessionId, { userId: String(user._id) });

    await Conversation.updateOne(
      { session_id: sessionId },
      {
        $set: {
          user: user._id
        }
      }
    );

    return updatedSession;
  }

  async destroySession(sessionId) {
    await this.redis.del(this._redisKey(sessionId));
    await Conversation.deleteOne({ session_id: sessionId });
  }
}

let sessionManagerInstance = null;

export const getSessionManager = (app) => {
  if (sessionManagerInstance) return sessionManagerInstance;

  const redisClient = app.get('redisClient');
  if (!redisClient) {
    throw new Error('Redis client not found on app instance');
  }

  sessionManagerInstance = new SessionManager({ redisClient });
  return sessionManagerInstance;
};

export default SessionManager;
