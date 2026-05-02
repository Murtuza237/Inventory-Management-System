const analyticsService = require('../services/analyticsService');

const getDashboard = async (req, res, next) => {
  try {
    const days = parseInt(req.query.days) || 30;
    const data = await analyticsService.getDashboardData(days);
    res.status(200).json({ success: true, period: `${days} days`, data });
  } catch (error) {
    next(error);
  }
};

const getTopProducts = async (req, res, next) => {
  try {
    const days  = parseInt(req.query.days) || 30;
    const limit = parseInt(req.query.limit) || 10;
    const data = await analyticsService.getTopSellingProducts(days, limit);
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

const getRevenueTrends = async (req, res, next) => {
  try {
    const days = parseInt(req.query.days) || 30;
    const data = await analyticsService.getRevenueTrends(days);
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

const getDemandPrediction = async (req, res, next) => {
  try {
    const days = parseInt(req.query.days) || 30;
    const data = await analyticsService.getDemandPrediction(days);
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

const getRestockAlerts = async (req, res, next) => {
  try {
    const data = await analyticsService.getRestockingAlerts();
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

const getSegmentation = async (req, res, next) => {
  try {
    const days = parseInt(req.query.days) || 30;
    const data = await analyticsService.getTransactionSegmentation(days);
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

const getInventoryHealth = async (req, res, next) => {
  try {
    const data = await analyticsService.getInventoryHealth();
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboard, getTopProducts, getRevenueTrends,
  getDemandPrediction, getRestockAlerts, getSegmentation, getInventoryHealth,
};
