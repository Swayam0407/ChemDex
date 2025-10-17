const CompoundRepository = require('../repositories/CompoundRepository');
const { NotFoundError, DatabaseError } = require('../middleware/errorHandler');
const logger = require('../utils/logger');

/**
 * Controller for compound-related API endpoints
 * Requirements: 4.1, 4.2, 4.3, 4.5, 7.4
 */
class CompoundController {
  constructor() {
    this.repository = new CompoundRepository();
  }

  /**
   * Get paginated list of compounds
   * GET /api/compounds?page=1&limit=10&search=term
   */
  async getCompounds(req, res, next) {
    const startTime = Date.now();
    
    try {
      const { page, limit, search } = req.query;
      
      logger.debug('Fetching compounds', {
        requestId: req.requestId,
        page,
        limit,
        search
      });
      
      const result = await this.repository.findAllPaginated({
        page,
        limit,
        search
      });

      const duration = Date.now() - startTime;
      logger.debug('Compounds fetched successfully', {
        requestId: req.requestId,
        count: result.compounds.length,
        totalCount: result.pagination.totalCount,
        duration: `${duration}ms`
      });

      res.json({
        success: true,
        data: result.compounds,
        pagination: result.pagination
      });
    } catch (error) {
      const duration = Date.now() - startTime;
      logger.error('Failed to fetch compounds', {
        requestId: req.requestId,
        error: error.message,
        duration: `${duration}ms`
      });
      
      throw new DatabaseError('Failed to retrieve compounds', error);
    }
  }

  /**
   * Get compound by ID
   * GET /api/compounds/:id
   */
  async getCompoundById(req, res, next) {
    const startTime = Date.now();
    
    try {
      const { id } = req.params;
      
      logger.debug('Fetching compound by ID', {
        requestId: req.requestId,
        compoundId: id
      });
      
      const compound = await this.repository.findById(id);
      
      if (!compound) {
        logger.warn('Compound not found', {
          requestId: req.requestId,
          compoundId: id
        });
        
        throw new NotFoundError(`Compound with ID ${id}`);
      }

      const duration = Date.now() - startTime;
      logger.debug('Compound fetched successfully', {
        requestId: req.requestId,
        compoundId: id,
        duration: `${duration}ms`
      });

      res.json({
        success: true,
        data: compound
      });
    } catch (error) {
      const duration = Date.now() - startTime;
      
      if (error.isOperational) {
        throw error; // Re-throw operational errors (like NotFoundError)
      }
      
      logger.error('Failed to fetch compound by ID', {
        requestId: req.requestId,
        compoundId: req.params.id,
        error: error.message,
        duration: `${duration}ms`
      });
      
      throw new DatabaseError('Failed to retrieve compound', error);
    }
  }

  /**
   * Update compound by ID
   * PUT /api/compounds/:id
   */
  async updateCompound(req, res, next) {
    const startTime = Date.now();
    
    try {
      const { id } = req.params;
      const updateData = req.body;

      logger.debug('Updating compound', {
        requestId: req.requestId,
        compoundId: id,
        updateFields: Object.keys(updateData)
      });

      // Check if compound exists first
      const exists = await this.repository.existsById(id);
      if (!exists) {
        logger.warn('Attempted to update non-existent compound', {
          requestId: req.requestId,
          compoundId: id
        });
        
        throw new NotFoundError(`Compound with ID ${id}`);
      }

      const updatedCompound = await this.repository.updateById(id, updateData);

      const duration = Date.now() - startTime;
      logger.info('Compound updated successfully', {
        requestId: req.requestId,
        compoundId: id,
        updatedFields: Object.keys(updateData),
        duration: `${duration}ms`
      });

      res.json({
        success: true,
        data: updatedCompound,
        message: 'Compound updated successfully'
      });
    } catch (error) {
      const duration = Date.now() - startTime;
      
      if (error.isOperational) {
        throw error; // Re-throw operational errors
      }
      
      logger.error('Failed to update compound', {
        requestId: req.requestId,
        compoundId: req.params.id,
        updateData: req.body,
        error: error.message,
        duration: `${duration}ms`
      });
      
      throw new DatabaseError('Failed to update compound', error);
    }
  }

  /**
   * Create new compound
   * POST /api/compounds
   */
  async createCompound(req, res, next) {
    const startTime = Date.now();
    
    try {
      const compoundData = req.body;
      
      logger.debug('Creating new compound', {
        requestId: req.requestId,
        compoundName: compoundData.name
      });
      
      const newCompound = await this.repository.create(compoundData);

      const duration = Date.now() - startTime;
      logger.info('Compound created successfully', {
        requestId: req.requestId,
        compoundId: newCompound.id,
        compoundName: newCompound.name,
        duration: `${duration}ms`
      });

      res.status(201).json({
        success: true,
        data: newCompound,
        message: 'Compound created successfully'
      });
    } catch (error) {
      const duration = Date.now() - startTime;
      
      logger.error('Failed to create compound', {
        requestId: req.requestId,
        compoundData: req.body,
        error: error.message,
        duration: `${duration}ms`
      });
      
      throw new DatabaseError('Failed to create compound', error);
    }
  }

  /**
   * Delete compound by ID
   * DELETE /api/compounds/:id
   */
  async deleteCompound(req, res, next) {
    const startTime = Date.now();
    
    try {
      const { id } = req.params;
      
      logger.debug('Deleting compound', {
        requestId: req.requestId,
        compoundId: id
      });
      
      const deleted = await this.repository.deleteById(id);
      
      if (!deleted) {
        logger.warn('Attempted to delete non-existent compound', {
          requestId: req.requestId,
          compoundId: id
        });
        
        throw new NotFoundError(`Compound with ID ${id}`);
      }

      const duration = Date.now() - startTime;
      logger.info('Compound deleted successfully', {
        requestId: req.requestId,
        compoundId: id,
        duration: `${duration}ms`
      });

      res.json({
        success: true,
        message: 'Compound deleted successfully'
      });
    } catch (error) {
      const duration = Date.now() - startTime;
      
      if (error.isOperational) {
        throw error; // Re-throw operational errors
      }
      
      logger.error('Failed to delete compound', {
        requestId: req.requestId,
        compoundId: req.params.id,
        error: error.message,
        duration: `${duration}ms`
      });
      
      throw new DatabaseError('Failed to delete compound', error);
    }
  }
}

module.exports = CompoundController;