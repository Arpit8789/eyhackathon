// backend/middleware/auth.js

/**
 * Very lightweight auth middleware for demo:
 * - Reads X-User-Id header
 * - Attaches userId to req.user
 * In later phases, this can be extended to JWT, etc.
 */
export const demoAuth = (req, res, next) => {
  const userId = req.header('X-User-Id');

  if (!userId) {
    // For demo, we do not block; we just mark as anonymous
    req.user = { id: null, isAnonymous: true };
    return next();
  }

  req.user = { id: userId, isAnonymous: false };
  return next();
};

export default demoAuth;
