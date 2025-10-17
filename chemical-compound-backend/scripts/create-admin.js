const mongoose = require('mongoose');
require('dotenv').config();

const User = require('../src/models/User');
const { connectMongoDB } = require('../src/config/mongodb');
const logger = require('../src/utils/logger');

const createAdminUser = async () => {
  try {
    await connectMongoDB();
    
    // Check if admin already exists
    const existingAdmin = await User.findOne({ role: 'admin' });
    
    if (existingAdmin) {
      logger.info('Admin user already exists', { 
        username: existingAdmin.username,
        email: existingAdmin.email 
      });
      return;
    }

    // Create admin user
    const adminUser = new User({
      username: 'admin',
      email: 'admin@example.com',
      password: 'Admin123!',
      role: 'admin'
    });

    await adminUser.save();
    
    logger.info('Admin user created successfully', {
      username: adminUser.username,
      email: adminUser.email,
      role: adminUser.role
    });

    console.log('\n=== Admin User Created ===');
    console.log('Username: admin');
    console.log('Email: admin@example.com');
    console.log('Password: Admin123!');
    console.log('Role: admin');
    console.log('\nPlease change the password after first login!');
    console.log('==========================\n');

  } catch (error) {
    logger.error('Error creating admin user', { error: error.message });
    console.error('Failed to create admin user:', error.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
};

createAdminUser();