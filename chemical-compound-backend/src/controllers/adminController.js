const User = require('../models/User');
const logger = require('../utils/logger');

const getUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, role } = req.query;
    const skip = (page - 1) * limit;

    // Build query
    const query = {};
    
    if (search) {
      query.$or = [
        { username: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (role && ['user', 'admin'].includes(role)) {
      query.role = role;
    }

    // Get users with pagination
    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await User.countDocuments(query);

    logger.info('Users retrieved successfully', {
      count: users.length,
      total,
      page,
      limit,
      requestId: req.requestId
    });

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    logger.error('Get users error', {
      error: error.message,
      requestId: req.requestId
    });

    res.status(500).json({
      success: false,
      message: 'Failed to retrieve users'
    });
  }
};

const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    logger.info('User retrieved successfully', {
      userId: user._id,
      requestId: req.requestId
    });

    res.json({
      success: true,
      data: {
        user
      }
    });
  } catch (error) {
    logger.error('Get user by ID error', {
      error: error.message,
      requestId: req.requestId
    });

    res.status(500).json({
      success: false,
      message: 'Failed to retrieve user'
    });
  }
};

const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    // Prevent admin from changing their own role
    if (id === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Cannot change your own role'
      });
    }

    const user = await User.findByIdAndUpdate(
      id,
      { role },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    logger.info('User role updated successfully', {
      userId: user._id,
      newRole: role,
      updatedBy: req.user._id,
      requestId: req.requestId
    });

    res.json({
      success: true,
      message: 'User role updated successfully',
      data: {
        user
      }
    });
  } catch (error) {
    logger.error('Update user role error', {
      error: error.message,
      requestId: req.requestId
    });

    res.status(500).json({
      success: false,
      message: 'Failed to update user role'
    });
  }
};

const toggleUserStatus = async (req, res) => {
  try {
    const { id } = req.params;

    // Prevent admin from deactivating themselves
    if (id === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Cannot change your own status'
      });
    }

    const user = await User.findById(id).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    user.isActive = !user.isActive;
    await user.save();

    logger.info('User status toggled successfully', {
      userId: user._id,
      newStatus: user.isActive,
      updatedBy: req.user._id,
      requestId: req.requestId
    });

    res.json({
      success: true,
      message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully`,
      data: {
        user
      }
    });
  } catch (error) {
    logger.error('Toggle user status error', {
      error: error.message,
      requestId: req.requestId
    });

    res.status(500).json({
      success: false,
      message: 'Failed to update user status'
    });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Prevent admin from deleting themselves
    if (id === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete your own account'
      });
    }

    const user = await User.findByIdAndDelete(id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    logger.info('User deleted successfully', {
      deletedUserId: id,
      deletedBy: req.user._id,
      requestId: req.requestId
    });

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    logger.error('Delete user error', {
      error: error.message,
      requestId: req.requestId
    });

    res.status(500).json({
      success: false,
      message: 'Failed to delete user'
    });
  }
};

module.exports = {
  getUsers,
  getUserById,
  updateUserRole,
  toggleUserStatus,
  deleteUser
};