/**
 * Request logging middleware
 * Requirements: 7.3, 7.4
 */

const logger = require('../utils/logger');
const { v4: uuidv4 } = require('uuid');

/**
 * Generate unique request ID
 */
const generateRequestId = () => {
  return uuidv4().split('-')[0]; // Use first part of UUID for shorter ID
};

/**
 * Request ID middleware - adds unique ID to each request
 */
const requestIdMiddleware = (req, res, next) => {
  req.requestId = generateRequestId();
  res.setHeader('X-Request-ID', req.requestId);
  next();
};

/**
 * Request logging middleware
 */
const requestLoggingMiddleware = (req, res, next) => {
  const startTime = Date.now();
  
  // Log incoming request
  logger.info('Incoming request', {
    requestId: req.requestId,
    method: req.method,
    url: req.url,
    userAgent: req.get('User-Agent'),
    ip: req.ip || req.connection.remoteAddress,
    contentType: req.get('Content-Type'),
    contentLength: req.get('Content-Length')
  });

  // Override res.end to log response
  const originalEnd = res.end;
  res.end = function(chunk, encoding) {
    const responseTime = Date.now() - startTime;
    
    // Log response
    logger.logRequest(req, res, responseTime);
    
    // Call original end method
    originalEnd.call(this, chunk, encoding);
  };

  next();
};

/**
 * Error request logging middleware
 */
const errorRequestLoggingMiddleware = (err, req, res, next) => {
  logger.error('Request error', {
    requestId: req.requestId,
    method: req.method,
    url: req.url,
    error: {
      name: err.name,
      message: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    },
    userAgent: req.get('User-Agent'),
    ip: req.ip || req.connection.remoteAddress
  });

  next(err);
};

module.exports = {
  requestIdMiddleware,
  requestLoggingMiddleware,
  errorRequestLoggingMiddleware
};