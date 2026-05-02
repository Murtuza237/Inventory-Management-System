const express = require('express');
const router = express.Router();
const { body } = require('express-validator');

const {
  getAllProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  getLowStock,
} = require('../controllers/inventoryController');
const { protect, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');

// ─── Authenticated routes ───────────────────────────────────────────────────────
router.use(protect);

// Read access for all authenticated roles
router.get('/', getAllProducts);
router.get('/low-stock', getLowStock);
router.get('/:id', getProduct);

// Write access for admin and manager
router.post(
  '/',
  authorize('admin', 'manager'),
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('rfid').notEmpty().withMessage('RFID is required'),
    body('price').isFloat({ min: 0 }).withMessage('Price must be non-negative'),
  ],
  validate,
  createProduct
);

router.put('/:id', authorize('admin', 'manager'), updateProduct);
router.delete('/:id', authorize('admin'), deleteProduct);

module.exports = router;
