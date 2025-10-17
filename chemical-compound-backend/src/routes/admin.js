const express = require('express');
const { body, param, query } = require('express-validator');
const { authenticate, authorize } = require('../middleware/auth');
const { validateRequest } = require('../middleware/validation');
const {
  getUsers,
  getUserById,
  updateUserRole,
  toggleUserStatus,
  deleteUser
} = require('../controllers/adminController');

const router = express.Router();

// All admin routes require authentication and admin role
router.use(authenticate);
router.use(authorize('admin'));

// User list validation
const getUsersValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  
  query('search')
    .optional()
    .trim()
    .isLength({ max: 255 })
    .withMessage('Search term must be no more than 255 characters'),
  
  query('role')
    .optional()
    .isIn(['user', 'admin'])
    .withMessage('Role must be either user or admin')
];

// User ID validation
const userIdValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid user ID format')
];

// Role update validation
const updateRoleValidation = [
  body('role')
    .isIn(['user', 'admin'])
    .withMessage('Role must be either user or admin')
];

// Routes
router.get('/users', getUsersValidation, validateRequest, getUsers);
router.get('/users/:id', userIdValidation, validateRequest, getUserById);
router.put('/users/:id/role', userIdValidation, updateRoleValidation, validateRequest, updateUserRole);
router.put('/users/:id/toggle-status', userIdValidation, validateRequest, toggleUserStatus);
router.delete('/users/:id', userIdValidation, validateRequest, deleteUser);

module.exports = router;