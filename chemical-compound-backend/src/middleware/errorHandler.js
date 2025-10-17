/**
 * Enhanced error handling middleware
 * Requirements: 7.3, 7.4
 */

const logger = require('../utils/logger');

/**
 * Custom error class for application-specific errors
 */
class AppError extends Error {
  constructor(message, statusCode, code = null, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.isOperational = true;
    
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Validation error class
 */
class ValidationError extends AppError {
  constructor(message, details = []) {
    super(message, 400, 'VALIDATION_ERROR', details);
  }
}

/**
 * Not found error class
 */
class NotFoundError extends AppError {
  constructor(resource = 'Resource') {
    super(`${resource} not found`, 404, 'NOT_FOUND');
  }
}

/**
 * Database error class
 */
class DatabaseError extends AppError {
  constructor(message = 'Database operation failed', originalError = null) {
    super(message, 500, 'DATABASE_ERROR');
    this.originalError = originalError;
  }
}

/**
 * Handle Sequelize validation errors
 */
const handleSequelizeValidationError = (err) => {
  const details = err.errors?.map(error => ({
    field: error.path,
    message: error.message,
    value: error.value
  })) || [];

  return new ValidationError('Database validation failed', details);
};

/**
 * Handle Sequelize database errors
 */
const handleSequelizeDatabaseError = (err) => {
  logger.error('Sequelize Database Error:', {
    message: err.message,
    sql: err.sql,
    parameters: err.parameters
  });

  // Handle specific database errors
  if (err.name === 'SequelizeConnectionError') {
    return new DatabaseError('Database connection failed');
  }
  
  if (err.name === 'SequelizeTimeoutError') {
    return new DatabaseError('Database operation timed out');
  }
  
  if (err.name === 'SequelizeUniqueConstraintError') {
    const field = err.errors?.[0]?.path || 'field';
    return new ValidationError(`${field} must be unique`, [{
      field,
      message: `This ${field} is already in use`
    }]);
  }
  
  if (err.name === 'SequelizeForeignKeyConstraintError') {
    return new ValidationError('Invalid reference to related data');
  }

  return new DatabaseError('Database operation failed', err);
};

/**
 * Handle different types of errors and convert them to AppError instances
 */
const handleError = (err) => {
  // Already an AppError
  if (err.isOperational) {
    return err;
  }

  // Sequelize errors
  if (err.name === 'SequelizeValidationError') {
    return handleSequelizeValidationError(err);
  }
  
  if (err.name && err.name.startsWith('Sequelize')) {
    return handleSequelizeDatabaseError(err);
  }

  // JSON parsing errors
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return new ValidationError('Invalid JSON in request body');
  }

  // Default to internal server error
  logger.error('Unhandled Error:', {
    name: err.name,
    message: err.message,
    stack: err.stack
  });

  return new AppError('Internal server error', 500, 'INTERNAL_ERROR');
};

/**
 * Send error response to client
 */
const sendErrorResponse = (err, req, res) => {
  const { statusCode, message, code, details } = err;
  
  // Log error details
  logger.error('API Error Response:', {
    statusCode,
    message,
    code,
    details,
    url: req.url,
    method: req.method,
    userAgent: req.get('User-Agent'),
    ip: req.ip,
    timestamp: new Date().toISOString()
  });

  // Prepare error response
  const errorResponse = {
    success: false,
    error: {
      code: code || 'UNKNOWN_ERROR',
      message: message || 'An error occurred'
    },
    timestamp: new Date().toISOString()
  };

  // Add details for validation errors
  if (details && Array.isArray(details) && details.length > 0) {
    errorResponse.error.details = details;
  }

  // Add request ID for tracking (if available)
  if (req.requestId) {
    errorResponse.requestId = req.requestId;
  }

  // In development, include stack trace for 5xx errors
  if (process.env.NODE_ENV === 'development' && statusCode >= 500) {
    errorResponse.error.stack = err.stack;
  }

  res.status(statusCode).json(errorResponse);
};

/**
 * Global error handling middleware
 */
const globalErrorHandler = (err, req, res, next) => {
  // Handle the error and convert to AppError if needed
  const appError = handleError(err);
  
  // Send error response
  sendErrorResponse(appError, req, res);
};

/**
 * Async error wrapper for route handlers
 */
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * 404 handler for unmatched routes
 */
const notFoundHandler = (req, res, next) => {
  const error = new NotFoundError(`Route ${req.method} ${req.path}`);
  next(error);
};

module.exports = {
  AppError,
  ValidationError,
  NotFoundError,
  DatabaseError,
  globalErrorHandler,
  asyncHandler,
  notFoundHandler
};