const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const ctrl = require('../controllers/analyticsController');

router.use(protect);
router.use(authorize('admin'));

router.get('/dashboard',        ctrl.getDashboard);
router.get('/top-products',     ctrl.getTopProducts);
router.get('/revenue-trends',   ctrl.getRevenueTrends);
router.get('/demand-prediction', ctrl.getDemandPrediction);
router.get('/restock-alerts',   ctrl.getRestockAlerts);
router.get('/segmentation',     ctrl.getSegmentation);
router.get('/inventory-health', ctrl.getInventoryHealth);

module.exports = router;
