const express = require('express');
const router = express.Router();
const { body } = require('express-validator');

const {
  getAllLocations,
  getLocation,
  createLocation,
  updateLocation,
  deleteLocation,
} = require('../controllers/locationController');
const { protect, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');

router.use(protect);

router.get('/', getAllLocations);
router.get('/:id', getLocation);

router.post(
  '/',
  authorize('admin'),
  [
    body('name').notEmpty().withMessage('Location name is required'),
  ],
  validate,
  createLocation
);

router.put('/:id', authorize('admin'), updateLocation);
router.delete('/:id', authorize('admin'), deleteLocation);

module.exports = router;
