const express = require('express');
const router = express.Router();

const { register, login, getMe, updateMe, getAllUsers, toggleUserStatus, deleteUser, updateRole } = require('../controllers/authController');
const { protect, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { registerRules, loginRules } = require('../middleware/validators');

// Public routes
router.post('/register', registerRules, validate, register);
router.post('/login', loginRules, validate, login);

// Protected routes
router.get('/me', protect, getMe);
router.put('/me', protect, updateMe);


// Admin-only routes
router.get('/users', protect, authorize('admin'), getAllUsers);
router.patch('/users/:id/toggle', protect, authorize('admin'), toggleUserStatus);
router.put('/users/:id/role', protect, authorize('admin'), updateRole);
router.delete('/users/:id', protect, authorize('admin'), deleteUser);

module.exports = router;
