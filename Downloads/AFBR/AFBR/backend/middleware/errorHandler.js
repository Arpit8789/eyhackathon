// backend/middleware/errorHandler.js

/**
 * Centralized error handler.
 * This can be plugged into app.js instead of the inline handler later.
 */
export const errorHandler = (err, req, res, next) => {
  // eslint-disable-line no-unused-vars
  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';

  if (process.env.NODE_ENV !== 'test') {
    console.error('Error:', status, message);
    if (err.stack) {
      console.error(err.stack);
    }
  }

  res.status(status).json({
    status: 'error',
    message
  });
};

export default errorHandler;
