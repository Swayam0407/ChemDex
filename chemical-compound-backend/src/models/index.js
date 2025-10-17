const { sequelize } = require('../config/database');
const Compound = require('./Compound');

/**
 * Models index file
 * Manages model initialization and associations
 * Requirements: 4.4, 5.4
 */

const models = {
  Compound
};

// Initialize associations
Object.keys(models).forEach(modelName => {
  if (models[modelName].associate) {
    models[modelName].associate(models);
  }
});

/**
 * Synchronize all models with the database
 * @param {Object} options - Sequelize sync options
 */
const syncDatabase = async (options = {}) => {
  try {
    await sequelize.sync(options);
    console.log('Database synchronized successfully');
  } catch (error) {
    console.error('Database synchronization failed:', error);
    throw error;
  }
};

/**
 * Test database connection and sync models
 */
const initializeDatabase = async () => {
  try {
    // Test connection
    await sequelize.authenticate();
    console.log('Database connection established successfully');
    
    // Sync models (create tables if they don't exist)
    await syncDatabase({ alter: false }); // Set to true in development if you want to alter existing tables
    
    return true;
  } catch (error) {
    console.error('Database initialization failed:', error);
    return false;
  }
};

module.exports = {
  sequelize,
  models,
  Compound,
  syncDatabase,
  initializeDatabase
};