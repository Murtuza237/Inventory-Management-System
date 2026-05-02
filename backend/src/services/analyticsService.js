const mongoose = require('mongoose');
const Transaction = require('../models/Transaction');
const Product = require('../models/Product');
const logger = require('../utils/logger');

// ═══════════════════════════════════════════════════════════════════════════════
// UTILITY: Simple linear regression for trend/prediction
// ═══════════════════════════════════════════════════════════════════════════════
function linearRegression(points) {
  const n = points.length;
  if (n < 2) return { slope: 0, intercept: 0, r2: 0, predict: () => 0 };

  let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0, sumY2 = 0;
  for (const { x, y } of points) {
    sumX  += x;
    sumY  += y;
    sumXY += x * y;
    sumX2 += x * x;
    sumY2 += y * y;
  }

  const denom = n * sumX2 - sumX * sumX;
  const slope     = denom === 0 ? 0 : (n * sumXY - sumX * sumY) / denom;
  const intercept = (sumY - slope * sumX) / n;

  // R² (coefficient of determination)
  const ssTot = sumY2 - (sumY * sumY) / n;
  const ssRes = points.reduce((s, { x, y }) => s + (y - (slope * x + intercept)) ** 2, 0);
  const r2 = ssTot === 0 ? 0 : 1 - ssRes / ssTot;

  return { slope, intercept, r2, predict: (x) => slope * x + intercept };
}

// Moving average
function movingAverage(values, window = 7) {
  const result = [];
  for (let i = 0; i < values.length; i++) {
    const start = Math.max(0, i - window + 1);
    const slice = values.slice(start, i + 1);
    result.push(slice.reduce((a, b) => a + b, 0) / slice.length);
  }
  return result;
}

// ═══════════════════════════════════════════════════════════════════════════════
// 1. TOP SELLING PRODUCTS
// ═══════════════════════════════════════════════════════════════════════════════
const getTopSellingProducts = async (days = 30, limit = 10) => {
  const since = new Date();
  since.setDate(since.getDate() - days);

  const result = await Transaction.aggregate([
    { $match: { createdAt: { $gte: since }, status: 'completed' } },
    { $unwind: '$items' },
    {
      $group: {
        _id: '$items.product',
        productName: { $first: '$items.productName' },
        totalQuantity: { $sum: '$items.quantity' },
        totalRevenue: { $sum: '$items.subtotal' },
        transactionCount: { $sum: 1 },
      },
    },
    { $sort: { totalRevenue: -1 } },
    { $limit: limit },
  ]);

  return result.map((r, i) => ({
    rank: i + 1,
    productId: r._id,
    productName: r.productName,
    totalQuantity: parseFloat(r.totalQuantity.toFixed(2)),
    totalRevenue: parseFloat(r.totalRevenue.toFixed(2)),
    transactionCount: r.transactionCount,
  }));
};

// ═══════════════════════════════════════════════════════════════════════════════
// 2. REVENUE TRENDS + FORECAST
// ═══════════════════════════════════════════════════════════════════════════════
const getRevenueTrends = async (days = 30) => {
  const since = new Date();
  since.setDate(since.getDate() - days);

  const daily = await Transaction.aggregate([
    { $match: { createdAt: { $gte: since }, status: 'completed' } },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        revenue: { $sum: '$finalAmount' },
        orders: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  // Fill missing dates with 0
  const filled = [];
  const dateMap = Object.fromEntries(daily.map((d) => [d._id, d]));
  for (let i = 0; i < days; i++) {
    const d = new Date(since);
    d.setDate(d.getDate() + i);
    const key = d.toISOString().split('T')[0];
    filled.push({
      date: key,
      revenue: dateMap[key]?.revenue || 0,
      orders: dateMap[key]?.orders || 0,
    });
  }

  // Linear regression for 7-day forecast
  const points = filled.map((d, i) => ({ x: i, y: d.revenue }));
  const model = linearRegression(points);
  const forecast = [];
  for (let i = 1; i <= 7; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    forecast.push({
      date: d.toISOString().split('T')[0],
      predictedRevenue: Math.max(0, parseFloat(model.predict(filled.length + i).toFixed(2))),
    });
  }

  // Moving average
  const ma7 = movingAverage(filled.map((d) => d.revenue), 7);

  return {
    daily: filled.map((d, i) => ({ ...d, movingAvg7d: parseFloat(ma7[i].toFixed(2)) })),
    forecast,
    trend: {
      slope: parseFloat(model.slope.toFixed(2)),
      direction: model.slope > 0 ? 'increasing' : model.slope < 0 ? 'decreasing' : 'flat',
      r2: parseFloat(model.r2.toFixed(4)),
    },
    summary: {
      totalRevenue: parseFloat(filled.reduce((s, d) => s + d.revenue, 0).toFixed(2)),
      totalOrders: filled.reduce((s, d) => s + d.orders, 0),
      avgDailyRevenue: parseFloat((filled.reduce((s, d) => s + d.revenue, 0) / days).toFixed(2)),
    },
  };
};

// ═══════════════════════════════════════════════════════════════════════════════
// 3. DEMAND PREDICTION (per-product)
// ═══════════════════════════════════════════════════════════════════════════════
const getDemandPrediction = async (days = 30) => {
  const since = new Date();
  since.setDate(since.getDate() - days);

  const productSales = await Transaction.aggregate([
    { $match: { createdAt: { $gte: since }, status: 'completed' } },
    { $unwind: '$items' },
    {
      $group: {
        _id: {
          product: '$items.product',
          date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        },
        productName: { $first: '$items.productName' },
        dailyQty: { $sum: '$items.quantity' },
      },
    },
    { $sort: { '_id.date': 1 } },
  ]);

  // Group by product
  const byProduct = {};
  for (const row of productSales) {
    const pid = row._id.product.toString();
    if (!byProduct[pid]) byProduct[pid] = { name: row.productName, dailySales: [] };
    byProduct[pid].dailySales.push({ date: row._id.date, qty: row.dailyQty });
  }

  // For each product: compute trend + predict next 7 days demand
  const predictions = [];
  for (const [pid, data] of Object.entries(byProduct)) {
    const points = data.dailySales.map((d, i) => ({ x: i, y: d.qty }));
    const model = linearRegression(points);
    const avgDaily = data.dailySales.reduce((s, d) => s + d.qty, 0) / data.dailySales.length;
    const next7d = Math.max(0, avgDaily * 7 + model.slope * 3.5);

    // Fetch current stock
    let currentStock = 0;
    try {
      const prod = await Product.findById(pid);
      if (prod) currentStock = prod.stockQuantity;
    } catch (_) {}

    const daysUntilStockout = avgDaily > 0 ? Math.floor(currentStock / avgDaily) : 999;

    predictions.push({
      productId: pid,
      productName: data.name,
      avgDailySales: parseFloat(avgDaily.toFixed(2)),
      trend: model.slope > 0.01 ? 'rising' : model.slope < -0.01 ? 'declining' : 'stable',
      trendSlope: parseFloat(model.slope.toFixed(4)),
      predicted7dDemand: parseFloat(next7d.toFixed(2)),
      currentStock: parseFloat(currentStock.toFixed(2)),
      daysUntilStockout,
      urgency: daysUntilStockout <= 3 ? 'critical' : daysUntilStockout <= 7 ? 'warning' : 'healthy',
    });
  }

  predictions.sort((a, b) => a.daysUntilStockout - b.daysUntilStockout);
  return predictions;
};

// ═══════════════════════════════════════════════════════════════════════════════
// 4. RESTOCKING ALERTS (AI-enhanced)
// ═══════════════════════════════════════════════════════════════════════════════
const getRestockingAlerts = async () => {
  const products = await Product.find({ isActive: true });
  const demandData = await getDemandPrediction(30);
  const demandMap = Object.fromEntries(demandData.map((d) => [d.productId, d]));

  const alerts = products.map((p) => {
    const demand = demandMap[p._id.toString()];
    const avgDaily = demand?.avgDailySales || 0;
    const daysLeft = avgDaily > 0 ? Math.floor(p.currentWeight / avgDaily) : 999;

    // Recommended restock quantity = 14 days of average daily demand
    const recommendedRestock = parseFloat((avgDaily * 14).toFixed(2));

    let severity = 'normal';
    let message = 'Stock levels adequate';
    if (p.isLowStock || daysLeft <= 3) {
      severity = 'critical';
      message = `Only ${daysLeft} day(s) of stock remaining! Restock immediately.`;
    } else if (daysLeft <= 7) {
      severity = 'warning';
      message = `${daysLeft} days of stock remaining. Plan restocking soon.`;
    } else if (daysLeft <= 14) {
      severity = 'attention';
      message = `${daysLeft} days of stock. Consider ordering.`;
    }

    return {
      productId: p._id,
      productName: p.name,
      rfid: p.rfid,
      currentWeight: p.currentWeight,
      lowStockThreshold: p.lowStockThreshold,
      isLowStock: p.isLowStock,
      avgDailySales: avgDaily,
      daysOfStockRemaining: daysLeft,
      recommendedRestockQty: recommendedRestock,
      severity,
      message,
    };
  });

  // Sort by severity
  const severityOrder = { critical: 0, warning: 1, attention: 2, normal: 3 };
  alerts.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

  return alerts;
};

// ═══════════════════════════════════════════════════════════════════════════════
// 5. CUSTOMER / TRANSACTION SEGMENTATION
// ═══════════════════════════════════════════════════════════════════════════════
const getTransactionSegmentation = async (days = 30) => {
  const since = new Date();
  since.setDate(since.getDate() - days);

  // Segment by payment method
  const byPayment = await Transaction.aggregate([
    { $match: { createdAt: { $gte: since }, status: 'completed' } },
    {
      $group: {
        _id: '$paymentMethod',
        count: { $sum: 1 },
        totalRevenue: { $sum: '$finalAmount' },
        avgOrderValue: { $avg: '$finalAmount' },
      },
    },
    { $sort: { totalRevenue: -1 } },
  ]);

  // Segment by order size (small / medium / large)
  const bySize = await Transaction.aggregate([
    { $match: { createdAt: { $gte: since }, status: 'completed' } },
    {
      $addFields: {
        sizeCategory: {
          $cond: [{ $lte: ['$finalAmount', 200] }, 'small',
            { $cond: [{ $lte: ['$finalAmount', 1000] }, 'medium', 'large'] }],
        },
      },
    },
    {
      $group: {
        _id: '$sizeCategory',
        count: { $sum: 1 },
        totalRevenue: { $sum: '$finalAmount' },
        avgOrderValue: { $avg: '$finalAmount' },
      },
    },
  ]);

  // Hourly distribution (peak hours analysis)
  const byHour = await Transaction.aggregate([
    { $match: { createdAt: { $gte: since }, status: 'completed' } },
    {
      $group: {
        _id: { $hour: '$createdAt' },
        count: { $sum: 1 },
        revenue: { $sum: '$finalAmount' },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  // Fill all 24 hours
  const hourlyData = Array.from({ length: 24 }, (_, h) => {
    const match = byHour.find((b) => b._id === h);
    return { hour: h, label: `${String(h).padStart(2, '0')}:00`, count: match?.count || 0, revenue: match?.revenue || 0 };
  });

  const peakHour = hourlyData.reduce((a, b) => (b.revenue > a.revenue ? b : a), hourlyData[0]);

  return { byPayment, bySize, hourlyDistribution: hourlyData, peakHour };
};

// ═══════════════════════════════════════════════════════════════════════════════
// 6. INVENTORY HEALTH SCORE (composite AI metric)
// ═══════════════════════════════════════════════════════════════════════════════
const getInventoryHealth = async () => {
  const products = await Product.find({ isActive: true });
  const total = products.length;
  if (total === 0) return { score: 100, breakdown: {} };

  const lowStockCount = products.filter((p) => p.isLowStock).length;
  const outOfStock    = products.filter((p) => p.currentWeight <= 0).length;
  const healthy       = total - lowStockCount;

  // Score: 100 = perfect, 0 = everything out
  const score = Math.round(((healthy / total) * 70) + ((1 - outOfStock / total) * 30));

  // Category distribution
  const categoryDist = {};
  for (const p of products) {
    const cat = p.category || 'Uncategorised';
    if (!categoryDist[cat]) categoryDist[cat] = { count: 0, lowStock: 0, totalWeight: 0 };
    categoryDist[cat].count++;
    categoryDist[cat].totalWeight += p.currentWeight;
    if (p.isLowStock) categoryDist[cat].lowStock++;
  }

  return {
    score,
    rating: score >= 80 ? 'Excellent' : score >= 60 ? 'Good' : score >= 40 ? 'Needs Attention' : 'Critical',
    totalProducts: total,
    healthyProducts: healthy,
    lowStockProducts: lowStockCount,
    outOfStockProducts: outOfStock,
    categoryBreakdown: Object.entries(categoryDist).map(([cat, d]) => ({
      category: cat, ...d,
    })),
  };
};

// ═══════════════════════════════════════════════════════════════════════════════
// 7. COMPREHENSIVE DASHBOARD DATA (single call)
// ═══════════════════════════════════════════════════════════════════════════════
const getDashboardData = async (days = 30) => {
  const [
    topProducts,
    revenueTrends,
    demandPrediction,
    restockAlerts,
    segmentation,
    inventoryHealth,
  ] = await Promise.all([
    getTopSellingProducts(days, 10),
    getRevenueTrends(days),
    getDemandPrediction(days),
    getRestockingAlerts(),
    getTransactionSegmentation(days),
    getInventoryHealth(),
  ]);

  return { topProducts, revenueTrends, demandPrediction, restockAlerts, segmentation, inventoryHealth };
};

module.exports = {
  getTopSellingProducts,
  getRevenueTrends,
  getDemandPrediction,
  getRestockingAlerts,
  getTransactionSegmentation,
  getInventoryHealth,
  getDashboardData,
};
