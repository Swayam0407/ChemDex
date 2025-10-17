const express = require('express');
const compoundRoutes = require('./compounds');
const authRoutes = require('./auth');
const adminRoutes = require('./admin');

const router = express.Router();

/**
 * API Routes
 * Base path: /api
 */

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Chemical Compound Manager API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Authentication routes
router.use('/auth', authRoutes);

// Admin routes
router.use('/admin', adminRoutes);

// Compound routes
router.use('/compounds', compoundRoutes);

// API info endpoint
router.get('/', (req, res) => {
  res.json({
    message: 'Chemical Compound Manager API',
    version: '1.0.0',
    endpoints: {
      auth: {
        'POST /api/auth/register': 'Register new user',
        'POST /api/auth/login': 'User login',
        'GET /api/auth/profile': 'Get user profile (requires auth)',
        'PUT /api/auth/profile': 'Update user profile (requires auth)',
        'PUT /api/auth/change-password': 'Change password (requires auth)'
      },
      admin: {
        'GET /api/admin/users': 'Get all users (admin only)',
        'GET /api/admin/users/:id': 'Get user by ID (admin only)',
        'PUT /api/admin/users/:id/role': 'Update user role (admin only)',
        'PUT /api/admin/users/:id/toggle-status': 'Toggle user active status (admin only)',
        'DELETE /api/admin/users/:id': 'Delete user (admin only)'
      },
      compounds: {
        'GET /api/compounds': 'Get paginated list of compounds',
        'GET /api/compounds/:id': 'Get compound by ID',
        'PUT /api/compounds/:id': 'Update compound by ID (admin only)',
        'POST /api/compounds': 'Create new compound (admin only)',
        'DELETE /api/compounds/:id': 'Delete compound by ID (admin only)'
      },
      health: {
        'GET /api/health': 'API health check'
      }
    }
  });
});

module.exports = router;