const express = require('express');
const CompoundController = require('../controllers/compoundController');
const { 
  validateCompoundUpdate,
  validateCompoundCreate, 
  validatePagination, 
  validateCompoundId 
} = require('../middleware/validation');
const { authenticate, authorize, optionalAuth } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');

const router = express.Router();
const compoundController = new CompoundController();

/**
 * Compound API routes
 * Requirements: 4.1, 4.2, 4.3, 4.5, 7.4
 */

/**
 * GET /api/compounds
 * Get paginated list of compounds with optional search
 * Query parameters:
 * - page: Page number (default: 1)
 * - limit: Items per page (default: 10, max: 100)
 * - search: Search term for compound name (optional)
 * Authentication: Required
 */
router.get('/', 
  authenticate,
  validatePagination,
  asyncHandler((req, res, next) => compoundController.getCompounds(req, res, next))
);

/**
 * GET /api/compounds/:id
 * Get compound by ID
 * Parameters:
 * - id: Compound ID (integer)
 * Authentication: Required
 */
router.get('/:id', 
  authenticate,
  validateCompoundId,
  asyncHandler((req, res, next) => compoundController.getCompoundById(req, res, next))
);

/**
 * PUT /api/compounds/:id
 * Update compound by ID (Admin only)
 * Parameters:
 * - id: Compound ID (integer)
 * Body:
 * - name: Compound name (optional, string, max 255 chars)
 * - image: Image URL (optional, string, max 500 chars, valid URL)
 * - description: Description (optional, string, max 5000 chars)
 * Authentication: Required (Admin role)
 */
router.put('/:id', 
  authenticate,
  authorize('admin'),
  validateCompoundId,
  validateCompoundUpdate,
  asyncHandler((req, res, next) => compoundController.updateCompound(req, res, next))
);

/**
 * POST /api/compounds
 * Create new compound (Admin only)
 * Body:
 * - name: Compound name (required, string, max 255 chars)
 * - image: Image URL (required, string, max 500 chars, valid URL)
 * - description: Description (optional, string, max 5000 chars)
 * Authentication: Required (Admin role)
 */
router.post('/', 
  authenticate,
  authorize('admin'),
  validateCompoundCreate,
  asyncHandler((req, res, next) => compoundController.createCompound(req, res, next))
);

/**
 * DELETE /api/compounds/:id
 * Delete compound by ID (Admin only)
 * Parameters:
 * - id: Compound ID (integer)
 * Authentication: Required (Admin role)
 */
router.delete('/:id', 
  authenticate,
  authorize('admin'),
  validateCompoundId,
  asyncHandler((req, res, next) => compoundController.deleteCompound(req, res, next))
);

module.exports = router;