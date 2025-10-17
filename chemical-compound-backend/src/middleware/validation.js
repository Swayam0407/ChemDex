/**
 * Enhanced validation middleware for API endpoints
 * Requirements: 7.3, 7.4
 */

const { validationResult } = require('express-validator');
const { ValidationError } = require('./errorHandler');
const logger = require('../utils/logger');

/**
 * Validation helper functions
 */
const validators = {
  /**
   * Validate string field
   */
  validateString(value, fieldName, options = {}) {
    const { required = false, minLength = 0, maxLength = Infinity, allowEmpty = false } = options;
    const errors = [];

    if (required && (value === undefined || value === null)) {
      errors.push({ field: fieldName, message: `${fieldName} is required` });
      return errors;
    }

    if (value !== undefined && value !== null) {
      if (typeof value !== 'string') {
        errors.push({ field: fieldName, message: `${fieldName} must be a string` });
        return errors;
      }

      const trimmedValue = value.trim();
      
      if (!allowEmpty && trimmedValue.length === 0 && value !== undefined) {
        errors.push({ field: fieldName, message: `${fieldName} cannot be empty` });
      }

      if (trimmedValue.length < minLength) {
        errors.push({ field: fieldName, message: `${fieldName} must be at least ${minLength} characters long` });
      }

      if (trimmedValue.length > maxLength) {
        errors.push({ field: fieldName, message: `${fieldName} must be no more than ${maxLength} characters long` });
      }
    }

    return errors;
  },

  /**
   * Validate URL field
   */
  validateUrl(value, fieldName, options = {}) {
    const { required = false, allowedProtocols = ['http:', 'https:'] } = options;
    const errors = [];

    // First validate as string
    const stringErrors = this.validateString(value, fieldName, { required, maxLength: 500 });
    if (stringErrors.length > 0) {
      return stringErrors;
    }

    if (value !== undefined && value !== null && value.trim().length > 0) {
      try {
        const url = new URL(value.trim());
        
        if (!allowedProtocols.includes(url.protocol)) {
          errors.push({ 
            field: fieldName, 
            message: `${fieldName} must use one of the following protocols: ${allowedProtocols.join(', ')}` 
          });
        }

        // Additional URL validation
        if (url.hostname.length === 0) {
          errors.push({ field: fieldName, message: `${fieldName} must have a valid hostname` });
        }

      } catch (e) {
        errors.push({ field: fieldName, message: `${fieldName} must be a valid URL` });
      }
    }

    return errors;
  },

  /**
   * Validate integer field
   */
  validateInteger(value, fieldName, options = {}) {
    const { required = false, min = -Infinity, max = Infinity } = options;
    const errors = [];

    if (required && (value === undefined || value === null)) {
      errors.push({ field: fieldName, message: `${fieldName} is required` });
      return errors;
    }

    if (value !== undefined && value !== null) {
      const numValue = parseInt(value, 10);
      
      if (isNaN(numValue)) {
        errors.push({ field: fieldName, message: `${fieldName} must be a valid integer` });
        return errors;
      }

      if (numValue < min) {
        errors.push({ field: fieldName, message: `${fieldName} must be at least ${min}` });
      }

      if (numValue > max) {
        errors.push({ field: fieldName, message: `${fieldName} must be no more than ${max}` });
      }
    }

    return errors;
  }
};

/**
 * Validate compound data for updates
 */
const validateCompoundUpdate = (req, res, next) => {
  try {
    const { name, image, description } = req.body;
    let errors = [];

    // Validate name (optional for updates)
    if (name !== undefined) {
      errors = errors.concat(validators.validateString(name, 'name', { 
        minLength: 1, 
        maxLength: 255 
      }));
    }

    // Validate image URL (optional for updates)
    if (image !== undefined) {
      errors = errors.concat(validators.validateUrl(image, 'image'));
    }

    // Validate description (optional for updates)
    if (description !== undefined) {
      errors = errors.concat(validators.validateString(description, 'description', { 
        maxLength: 5000,
        allowEmpty: true 
      }));
    }

    // Check if at least one field is provided for update
    if (name === undefined && image === undefined && description === undefined) {
      errors.push({ 
        message: 'At least one field (name, image, description) must be provided for update' 
      });
    }

    // Check for unexpected fields
    const allowedFields = ['name', 'image', 'description'];
    const providedFields = Object.keys(req.body);
    const unexpectedFields = providedFields.filter(field => !allowedFields.includes(field));
    
    if (unexpectedFields.length > 0) {
      errors.push({
        message: `Unexpected fields: ${unexpectedFields.join(', ')}. Allowed fields: ${allowedFields.join(', ')}`
      });
    }

    if (errors.length > 0) {
      logger.warn('Compound update validation failed', {
        errors,
        body: req.body,
        url: req.url
      });
      
      throw new ValidationError('Invalid input data for compound update', errors);
    }

    // Sanitize input data
    if (name !== undefined) req.body.name = name.trim();
    if (image !== undefined) req.body.image = image.trim();
    if (description !== undefined) req.body.description = description.trim();

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Validate pagination parameters
 */
const validatePagination = (req, res, next) => {
  try {
    const { page = 1, limit = 10, search } = req.query;
    let errors = [];

    // Validate page
    errors = errors.concat(validators.validateInteger(page, 'page', { min: 1 }));
    if (errors.length === 0) {
      req.query.page = parseInt(page, 10);
    }

    // Validate limit
    errors = errors.concat(validators.validateInteger(limit, 'limit', { min: 1, max: 100 }));
    if (errors.length === 0 || errors.every(e => e.field !== 'limit')) {
      req.query.limit = parseInt(limit, 10);
    }

    // Validate search parameter (optional)
    if (search !== undefined) {
      errors = errors.concat(validators.validateString(search, 'search', { 
        maxLength: 255,
        allowEmpty: true 
      }));
      
      if (errors.length === 0 || errors.every(e => e.field !== 'search')) {
        req.query.search = search.trim();
      }
    }

    // Check for unexpected query parameters
    const allowedParams = ['page', 'limit', 'search'];
    const providedParams = Object.keys(req.query);
    const unexpectedParams = providedParams.filter(param => !allowedParams.includes(param));
    
    if (unexpectedParams.length > 0) {
      errors.push({
        message: `Unexpected query parameters: ${unexpectedParams.join(', ')}. Allowed parameters: ${allowedParams.join(', ')}`
      });
    }

    if (errors.length > 0) {
      logger.warn('Pagination validation failed', {
        errors,
        query: req.query,
        url: req.url
      });
      
      throw new ValidationError('Invalid pagination parameters', errors);
    }

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Validate compound ID parameter
 */
const validateCompoundId = (req, res, next) => {
  try {
    const { id } = req.params;
    const errors = validators.validateInteger(id, 'id', { required: true, min: 1 });

    if (errors.length > 0) {
      logger.warn('Compound ID validation failed', {
        errors,
        params: req.params,
        url: req.url
      });
      
      throw new ValidationError('Invalid compound ID', errors);
    }

    req.params.id = parseInt(id, 10);
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Validate compound creation data
 */
const validateCompoundCreate = (req, res, next) => {
  try {
    const { name, image, description } = req.body;
    let errors = [];

    // Name is required for creation
    errors = errors.concat(validators.validateString(name, 'name', { 
      required: true, 
      minLength: 1, 
      maxLength: 255 
    }));

    // Image is required for creation
    errors = errors.concat(validators.validateUrl(image, 'image', { required: true }));

    // Description is optional but validate if provided
    if (description !== undefined) {
      errors = errors.concat(validators.validateString(description, 'description', { 
        maxLength: 5000,
        allowEmpty: true 
      }));
    }

    // Check for unexpected fields
    const allowedFields = ['name', 'image', 'description'];
    const providedFields = Object.keys(req.body);
    const unexpectedFields = providedFields.filter(field => !allowedFields.includes(field));
    
    if (unexpectedFields.length > 0) {
      errors.push({
        message: `Unexpected fields: ${unexpectedFields.join(', ')}. Allowed fields: ${allowedFields.join(', ')}`
      });
    }

    if (errors.length > 0) {
      logger.warn('Compound creation validation failed', {
        errors,
        body: req.body,
        url: req.url
      });
      
      throw new ValidationError('Invalid input data for compound creation', errors);
    }

    // Sanitize input data
    req.body.name = name.trim();
    req.body.image = image.trim();
    if (description !== undefined) {
      req.body.description = description.trim();
    }

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Express-validator request validation middleware
 */
const validateRequest = (req, res, next) => {
  try {
    const errors = validationResult(req);
    
    if (!errors.isEmpty()) {
      const formattedErrors = errors.array().map(error => ({
        field: error.path || error.param,
        message: error.msg,
        value: error.value
      }));

      logger.warn('Request validation failed', {
        errors: formattedErrors,
        body: req.body,
        url: req.url,
        requestId: req.requestId
      });
      
      throw new ValidationError('Validation failed', formattedErrors);
    }

    next();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  validateCompoundUpdate,
  validateCompoundCreate,
  validatePagination,
  validateCompoundId,
  validateRequest,
  validators
};