const { Sequelize } = require('sequelize');
const path = require('path');
require('dotenv').config();

/**
 * Sequelize database configuration with connection pooling and error handling
 * Requirements: 4.4, 5.4
 */

// Determine database configuration based on environment
let sequelize;

if (process.env.USE_SQLITE === 'true' || process.env.NODE_ENV === 'test') {
  // SQLite configuration for development/testing
  const dbPath = path.join(__dirname, '../../data/database.sqlite');
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: dbPath,
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    define: {
      timestamps: true,
      underscored: true
    }
  });
  console.log('Using SQLite database at:', dbPath);
} else {
  // MySQL configuration for production
  sequelize = new Sequelize(
    process.env.DB_NAME || 'chemical_compounds',
    process.env.DB_USER || 'root',
    process.env.DB_PASSWORD || '',
    {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      dialect: 'mysql',
      logging: process.env.NODE_ENV === 'development' ? console.log : false,
      
      // Connection pool configuration for better performance
      pool: {
        max: 10,        // Maximum number of connections in pool
        min: 2,         // Minimum number of connections in pool
        acquire: 30000, // Maximum time (ms) to get connection before throwing error
        idle: 10000,    // Maximum time (ms) connection can be idle before being released
        evict: 1000,    // Time interval (ms) to run eviction to remove idle connections
        handleDisconnects: true // Automatically handle disconnects
      },
      
      // Retry configuration
      retry: {
        match: [
          /ETIMEDOUT/,
          /EHOSTUNREACH/,
          /ECONNRESET/,
          /ECONNREFUSED/,
          /ETIMEDOUT/,
          /ESOCKETTIMEDOUT/,
          /EHOSTUNREACH/,
          /EPIPE/,
          /EAI_AGAIN/,
          /SequelizeConnectionError/,
          /SequelizeConnectionRefusedError/,
          /SequelizeHostNotFoundError/,
          /SequelizeHostNotReachableError/,
          /SequelizeInvalidConnectionError/,
          /SequelizeConnectionTimedOutError/
        ],
        max: 3 // Maximum retry attempts
      },
      
      // Additional options for better error handling
      dialectOptions: {
        connectTimeout: 60000,
        acquireTimeout: 60000,
        timeout: 60000,
        charset: 'utf8mb4'
      },
      
      // Define hooks for connection events
      hooks: {
        beforeConnect: () => {
          console.log('Attempting to connect to database...');
        },
        afterConnect: () => {
          console.log('Successfully connected to database');
        },
        beforeDisconnect: () => {
          console.log('Disconnecting from database...');
        }
      }
    }
  );
  console.log('Using MySQL database');
}

/**
 * Test the database connection with comprehensive error handling
 */
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');
    return true;
  } catch (error) {
    console.error('Unable to connect to the database:', error.message);
    
    // Log specific error types for better debugging
    if (error.name === 'SequelizeConnectionRefusedError') {
      console.error('Connection refused. Please check if MySQL server is running.');
    } else if (error.name === 'SequelizeAccessDeniedError') {
      console.error('Access denied. Please check database credentials.');
    } else if (error.name === 'SequelizeHostNotFoundError') {
      console.error('Host not found. Please check database host configuration.');
    }
    
    return false;
  }
};

/**
 * Gracefully close database connection
 */
const closeConnection = async () => {
  try {
    await sequelize.close();
    console.log('Database connection closed successfully.');
  } catch (error) {
    console.error('Error closing database connection:', error);
  }
};

// Handle process termination gracefully
process.on('SIGINT', async () => {
  console.log('Received SIGINT. Closing database connection...');
  await closeConnection();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('Received SIGTERM. Closing database connection...');
  await closeConnection();
  process.exit(0);
});

module.exports = { 
  sequelize, 
  testConnection, 
  closeConnection 
};