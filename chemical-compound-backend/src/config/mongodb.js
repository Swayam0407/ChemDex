const mongoose = require('mongoose');
const logger = require('../utils/logger');

const connectMongoDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/chemical-compounds';
    
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    logger.info('MongoDB connected successfully', { uri: mongoUri });
  } catch (error) {
    logger.error('MongoDB connection failed', { error: error.message });
    throw error;
  }
};

const disconnectMongoDB = async () => {
  try {
    await mongoose.disconnect();
    logger.info('MongoDB disconnected successfully');
  } catch (error) {
    logger.error('MongoDB disconnection failed', { error: error.message });
  }
};

module.exports = {
  connectMongoDB,
  disconnectMongoDB
};