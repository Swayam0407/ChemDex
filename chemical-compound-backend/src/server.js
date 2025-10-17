const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { testConnection } = require('./config/database');
const { connectMongoDB } = require('./config/mongodb');
const logger = require('./utils/logger');
const { 
  globalErrorHandler, 
  notFoundHandler 
} = require('./middleware/errorHandler');
const { 
  requestIdMiddleware, 
  requestLoggingMiddleware,
  errorRequestLoggingMiddleware 
} = require('./middleware/requestLogger');

const app = express();
const PORT = process.env.PORT || 3000;

// Request ID and logging middleware
app.use(requestIdMiddleware);
app.use(requestLoggingMiddleware);

// CORS middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:4200',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Security headers middleware
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});

// Basic health check route
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Chemical Compound Manager API is running',
    timestamp: new Date().toISOString(),
    requestId: req.requestId,
    environment: process.env.NODE_ENV || 'development'
  });
});

// API routes
const apiRoutes = require('./routes');
app.use('/api', apiRoutes);

// Error logging middleware
app.use(errorRequestLoggingMiddleware);

// 404 handler for unmatched routes
app.use(notFoundHandler);

// Global error handling middleware (must be last)
app.use(globalErrorHandler);

// Start server
const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectMongoDB();
    logger.info('MongoDB connection successful');
  } catch (error) {
    logger.error('MongoDB connection failed', { error: error.message });
    process.exit(1);
  }

  try {
    // Test database connection (but don't fail if it's not available)
    await testConnection();
    logger.info('SQL Database connection successful');
  } catch (error) {
    logger.warn('SQL Database connection failed, but server will continue', { 
      error: error.message 
    });
  }
  
  app.listen(PORT, () => {
    logger.info('Server started successfully', {
      port: PORT,
      environment: process.env.NODE_ENV || 'development',
      healthCheck: `http://localhost:${PORT}/health`,
      apiDocs: `http://localhost:${PORT}/api`
    });
  });
};

startServer();