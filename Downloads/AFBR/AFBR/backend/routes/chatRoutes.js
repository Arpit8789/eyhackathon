// backend/routes/chatRoutes.js
import express from 'express';
import { getSalesAgent } from '../agents/sales-agent.js';
import { validateChatMessage } from '../utils/validators.js';
import { getSessionManager } from '../services/session-manager.js';

const router = express.Router();

/**
 * POST /api/chat
 * Body: { message, sessionId?, userId?, channel? }
 * Returns: structured SalesAgent response.
 */
router.post('/', async (req, res, next) => {
  try {
    const { message, sessionId = null, userId = null, channel = 'web' } = req.body || {};
    const errors = validateChatMessage({ message, channel });

    if (errors.length) {
      return res.status(400).json({ status: 'error', errors });
    }

    const app = req.app;
    const salesAgent = getSalesAgent(app);

    const result = await salesAgent.handleMessage({
      app,
      sessionId,
      userId,
      channel,
      message
    });

    const sessionManager = getSessionManager(app);
    const session = await sessionManager.getSession(result.sessionId);

    return res.json({
      status: 'ok',
      data: {
        ...result,
        session
      }
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/chat/session/:sessionId
 * Quick session/context lookup for frontend to restore state after reload.
 */
router.get('/session/:sessionId', async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    const app = req.app;

    const sessionManager = getSessionManager(app);
    const contextManager = app.locals.contextManager;

    if (!app.locals.contextManager) {
      const { getContextManager } = await import('../services/context-manager.js');
      app.locals.contextManager = getContextManager(app);
    }

    const session = await sessionManager.getSession(sessionId);
    const context = await app.locals.contextManager.getContext(sessionId);

    if (!session || !context) {
      return res.status(404).json({
        status: 'error',
        message: 'Session not found'
      });
    }

    return res.json({
      status: 'ok',
      data: {
        session,
        context
      }
    });
  } catch (err) {
    next(err);
  }
});

export default router;
