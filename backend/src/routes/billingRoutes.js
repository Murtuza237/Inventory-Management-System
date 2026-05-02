const express = require('express');
const router = express.Router();
const { body } = require('express-validator');

const { createTransaction, getTransactions, getTransaction, getDailySummary } =
  require('../controllers/billingController');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');

router.use(protect);

router.get('/', getTransactions);
router.get('/summary', getDailySummary);
router.get('/:id', getTransaction);

router.post(
  '/',
  [
    body('items').isArray({ min: 1 }).withMessage('At least one item is required'),
    body('items.*.productId').notEmpty().withMessage('Each item must have a productId'),
    body('items.*.quantity').isFloat({ gt: 0 }).withMessage('Quantity must be greater than 0'),
    body('paymentMethod')
      .optional()
      .isIn(['cash', 'card', 'upi', 'other'])
      .withMessage('Invalid payment method'),
    body('discount').optional().isFloat({ min: 0 }).withMessage('Discount must be non-negative'),
  ],
  validate,
  createTransaction
);

module.exports = router;
