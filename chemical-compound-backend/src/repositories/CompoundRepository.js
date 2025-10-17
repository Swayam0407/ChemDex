const Compound = require('../models/Compound');
const { Op } = require('sequelize');

/**
 * Repository class for Compound CRUD operations
 * Provides abstraction layer between controllers and database
 * Requirements: 4.1, 4.4, 5.4
 */
class CompoundRepository {
  /**
   * Get paginated list of compounds
   * @param {Object} options - Query options
   * @param {number} options.page - Page number (1-based)
   * @param {number} options.limit - Number of items per page
   * @param {string} options.search - Optional search term for name
   * @returns {Promise<Object>} Paginated result with compounds and metadata
   */
  async findAllPaginated({ page = 1, limit = 10, search = null }) {
    try {
      const offset = (page - 1) * limit;
      
      // Build where clause for search
      const whereClause = {};
      if (search && search.trim()) {
        whereClause.name = {
          [Op.like]: `%${search.trim()}%`
        };
      }

      // Execute query with count
      const { count, rows } = await Compound.findAndCountAll({
        where: whereClause,
        limit: parseInt(limit, 10),
        offset: parseInt(offset, 10),
        order: [['name', 'ASC']],
        attributes: ['id', 'name', 'image', 'description', 'created_at', 'updated_at']
      });

      const totalPages = Math.ceil(count / limit);

      return {
        compounds: rows,
        pagination: {
          currentPage: parseInt(page, 10),
          totalPages,
          totalCount: count,
          limit: parseInt(limit, 10),
          hasNextPage: page < totalPages,
          hasPreviousPage: page > 1
        }
      };
    } catch (error) {
      console.error('Error in CompoundRepository.findAllPaginated:', error);
      throw new Error(`Failed to fetch compounds: ${error.message}`);
    }
  }

  /**
   * Find compound by ID
   * @param {number} id - Compound ID
   * @returns {Promise<Object|null>} Compound object or null if not found
   */
  async findById(id) {
    try {
      const compound = await Compound.findByPk(id, {
        attributes: ['id', 'name', 'image', 'description', 'created_at', 'updated_at']
      });

      return compound;
    } catch (error) {
      console.error('Error in CompoundRepository.findById:', error);
      throw new Error(`Failed to fetch compound with ID ${id}: ${error.message}`);
    }
  }

  /**
   * Update compound by ID
   * @param {number} id - Compound ID
   * @param {Object} updateData - Data to update
   * @param {string} updateData.name - Compound name
   * @param {string} updateData.image - Image URL
   * @param {string} updateData.description - Description
   * @returns {Promise<Object|null>} Updated compound or null if not found
   */
  async updateById(id, updateData) {
    try {
      // Find the compound first
      const compound = await Compound.findByPk(id);
      
      if (!compound) {
        return null;
      }

      // Filter out undefined values from updateData
      const filteredData = {};
      Object.keys(updateData).forEach(key => {
        if (updateData[key] !== undefined) {
          filteredData[key] = updateData[key];
        }
      });

      // Update the compound
      await compound.update(filteredData);

      // Return the updated compound
      return await this.findById(id);
    } catch (error) {
      console.error('Error in CompoundRepository.updateById:', error);
      
      // Handle validation errors specifically
      if (error.name === 'SequelizeValidationError') {
        const validationError = new Error('Validation failed');
        validationError.name = 'ValidationError';
        validationError.errors = error.errors.map(err => ({
          field: err.path,
          message: err.message
        }));
        throw validationError;
      }
      
      throw new Error(`Failed to update compound with ID ${id}: ${error.message}`);
    }
  }

  /**
   * Create a new compound
   * @param {Object} compoundData - Compound data
   * @param {string} compoundData.name - Compound name
   * @param {string} compoundData.image - Image URL
   * @param {string} compoundData.description - Description
   * @returns {Promise<Object>} Created compound
   */
  async create(compoundData) {
    try {
      const compound = await Compound.create(compoundData);
      return await this.findById(compound.id);
    } catch (error) {
      console.error('Error in CompoundRepository.create:', error);
      
      // Handle validation errors specifically
      if (error.name === 'SequelizeValidationError') {
        const validationError = new Error('Validation failed');
        validationError.name = 'ValidationError';
        validationError.errors = error.errors.map(err => ({
          field: err.path,
          message: err.message
        }));
        throw validationError;
      }
      
      throw new Error(`Failed to create compound: ${error.message}`);
    }
  }

  /**
   * Delete compound by ID
   * @param {number} id - Compound ID
   * @returns {Promise<boolean>} True if deleted, false if not found
   */
  async deleteById(id) {
    try {
      const compound = await Compound.findByPk(id);
      
      if (!compound) {
        return false;
      }

      await compound.destroy();
      return true;
    } catch (error) {
      console.error('Error in CompoundRepository.deleteById:', error);
      throw new Error(`Failed to delete compound with ID ${id}: ${error.message}`);
    }
  }

  /**
   * Check if compound exists by ID
   * @param {number} id - Compound ID
   * @returns {Promise<boolean>} True if exists, false otherwise
   */
  async existsById(id) {
    try {
      const count = await Compound.count({
        where: { id }
      });
      return count > 0;
    } catch (error) {
      console.error('Error in CompoundRepository.existsById:', error);
      throw new Error(`Failed to check if compound exists with ID ${id}: ${error.message}`);
    }
  }

  /**
   * Get total count of compounds
   * @returns {Promise<number>} Total count
   */
  async getTotalCount() {
    try {
      return await Compound.count();
    } catch (error) {
      console.error('Error in CompoundRepository.getTotalCount:', error);
      throw new Error(`Failed to get total count: ${error.message}`);
    }
  }
}

module.exports = CompoundRepository;