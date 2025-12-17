// backend/middleware/requestLogger.js
export const requestLogger = (req, res, next) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    const log = {
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      durationMs: duration
    };

    if (duration > 1000) {
      console.warn('⏱ Slow request:', log);
    } else {
      console.log('📨 Request:', log);
    }
  });

  next();
};

export default requestLogger;
