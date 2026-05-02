const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const logger = require('../utils/logger');

/**
 * Register a new user.
 */
const register = async ({ name, email, password, role }) => {
  const existing = await User.findOne({ email });
  if (existing) {
    const err = new Error('Email already registered');
    err.statusCode = 409;
    throw err;
  }

  const user = await User.create({ name, email, password, role });
  const token = generateToken({ id: user._id, role: user.role });

  logger.info(`New user registered: ${email} (${role})`);
  return { user, token };
};

/**
 * Login an existing user.
 */
const login = async ({ email, password }) => {
  const user = await User.findOne({ email }).select('+password');

  if (!user || !user.isActive) {
    const err = new Error('Invalid credentials');
    err.statusCode = 401;
    throw err;
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    const err = new Error('Invalid credentials');
    err.statusCode = 401;
    throw err;
  }

  const token = generateToken({ id: user._id, role: user.role });

  logger.info(`User logged in: ${email}`);
  return { user, token };
};

/**
 * Get all users (admin only).
 */
const getAllUsers = async () => {
  return User.find({}).sort({ createdAt: -1 });
};

/**
 * Toggle a user's active status.
 */
const toggleUserStatus = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    const err = new Error('User not found');
    err.statusCode = 404;
    throw err;
  }
  user.isActive = !user.isActive;
  await user.save();
  return user;
};

/**
 * Delete a user.
 */
const deleteUser = async (userId) => {
  const user = await User.findByIdAndDelete(userId);
  if (!user) {
    const err = new Error('User not found');
    err.statusCode = 404;
    throw err;
  }
  logger.info(`User deleted: ${user.email}`);
  return user;
};

/**
 * Update user role.
 */
const updateRole = async (userId, role) => {
  const user = await User.findById(userId);
  if (!user) {
    const err = new Error('User not found');
    err.statusCode = 404;
    throw err;
  }
  user.role = role;
  await user.save();
  logger.info(`User role updated: ${user.email} -> ${role}`);
  return user;
};

/**
 * Update user details.
 */
const updateUser = async (userId, updates) => {
  const user = await User.findById(userId);
  if (!user) {
    const err = new Error('User not found');
    err.statusCode = 404;
    throw err;
  }

  // Allow updating specific fields
  const allowedFields = ['name', 'photoURL', 'business'];
  allowedFields.forEach((field) => {
    if (updates[field] !== undefined) {
      if (field === 'business' && typeof updates[field] === 'object') {
        user.business = { ...user.business, ...updates[field] };
      } else {
        user[field] = updates[field];
      }
    }
  });

  await user.save();
  return user;
};

module.exports = { register, login, getAllUsers, toggleUserStatus, deleteUser, updateRole, updateUser };
