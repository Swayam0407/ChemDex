const User = require('../models/User');
const { generateToken } = require('../utils/jwt');
const logger = require('../utils/logger');

const register = async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email or username already exists'
      });
    }

    // Check if this is the first user (auto-promote to admin)
    const userCount = await User.countDocuments();
    const userRole = userCount === 0 ? 'admin' : (role || 'user');

    // Create new user
    const user = new User({
      username,
      email,
      password,
      role: userRole
    });

    await user.save();

    // Generate token
    const token = generateToken({
      userId: user._id,
      username: user.username,
      role: user.role
    });

    logger.info('User registered successfully', {
      userId: user._id,
      username: user.username,
      role: user.role,
      isFirstUser: userCount === 0,
      requestId: req.requestId
    });

    const message = userCount === 0 
      ? 'Welcome! As the first user, you have been granted admin privileges.'
      : 'User registered successfully';

    res.status(201).json({
      success: true,
      message,
      data: {
        user,
        token
      }
    });
  } catch (error) {
    logger.error('Registration error', {
      error: error.message,
      requestId: req.requestId
    });

    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: Object.values(error.errors).map(err => err.message)
      });
    }

    res.status(500).json({
      success: false,
      message: 'Registration failed'
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email }).select('+password');
    
    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate token
    const token = generateToken({
      userId: user._id,
      username: user.username,
      role: user.role
    });

    logger.info('User logged in successfully', {
      userId: user._id,
      username: user.username,
      role: user.role,
      requestId: req.requestId
    });

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: user.toJSON(),
        token
      }
    });
  } catch (error) {
    logger.error('Login error', {
      error: error.message,
      requestId: req.requestId
    });

    res.status(500).json({
      success: false,
      message: 'Login failed'
    });
  }
};

const getProfile = async (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        user: req.user
      }
    });
  } catch (error) {
    logger.error('Get profile error', {
      error: error.message,
      requestId: req.requestId
    });

    res.status(500).json({
      success: false,
      message: 'Failed to get profile'
    });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { username, email } = req.body;
    const userId = req.user._id;

    // Check if username or email is already taken by another user
    const existingUser = await User.findOne({
      _id: { $ne: userId },
      $or: [{ email }, { username }]
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Username or email already taken'
      });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { username, email },
      { new: true, runValidators: true }
    );

    logger.info('Profile updated successfully', {
      userId: user._id,
      requestId: req.requestId
    });

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user
      }
    });
  } catch (error) {
    logger.error('Update profile error', {
      error: error.message,
      requestId: req.requestId
    });

    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: Object.values(error.errors).map(err => err.message)
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to update profile'
    });
  }
};

const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user._id;

    const user = await User.findById(userId).select('+password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Verify current password
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    logger.info('Password changed successfully', {
      userId: user._id,
      requestId: req.requestId
    });

    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    logger.error('Change password error', {
      error: error.message,
      requestId: req.requestId
    });

    res.status(500).json({
      success: false,
      message: 'Failed to change password'
    });
  }
};

module.exports = {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword
};