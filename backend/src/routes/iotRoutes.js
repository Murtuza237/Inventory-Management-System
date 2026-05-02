const express = require('express');
const router = express.Router();
const { body } = require('express-validator');

const { iotWeightUpdate } = require('../controllers/inventoryController');
const validate = require('../middleware/validate');

// IoT endpoint (no auth — ESP32 uses API key or IP whitelist in production)
router.post(
  '/update',
  [
    body('rfid').notEmpty().withMessage('RFID is required'),
    body('weight').isFloat({ min: 0 }).withMessage('Weight must be a non-negative number'),
  ],
  validate,
  iotWeightUpdate
);

module.exports = router;
