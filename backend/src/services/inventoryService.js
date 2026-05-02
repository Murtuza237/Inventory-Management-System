const mongoose = require('mongoose');
const Product = require('../models/Product');
const logger = require('../utils/logger');

/**
 * Get all active products, optionally filtered by location.
 */
const getAllProducts = async (locationId) => {
  const filter = { isActive: true };
  if (locationId) filter.location = locationId;
  return Product.find(filter).populate('location', 'name').sort({ name: 1 });
};

/**
 * Get single product by ID.
 */
const getProductById = async (id) => {
  const product = await Product.findById(id).populate('location', 'name');
  if (!product) {
    const err = new Error('Product not found');
    err.statusCode = 404;
    throw err;
  }
  return product;
};

/**
 * Create a new product.
 */
const createProduct = async (data) => {
  const product = await Product.create(data);
  logger.info(`Product created: ${product.name} (RFID: ${product.rfid})`);
  return product;
};

/**
 * Update product fields.
 */
const updateProduct = async (id, data) => {
  const product = await Product.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  });
  if (!product) {
    const err = new Error('Product not found');
    err.statusCode = 404;
    throw err;
  }
  return product;
};

/**
 * Soft-delete a product.
 */
const deleteProduct = async (id) => {
  const product = await Product.findByIdAndUpdate(id, { isActive: false }, { new: true });
  if (!product) {
    const err = new Error('Product not found');
    err.statusCode = 404;
    throw err;
  }
  logger.info(`Product soft-deleted: ${id}`);
  return product;
};

/**
 * IoT weight update — called when ESP32 POSTs data.
 * Matches product by RFID, updates currentWeight and stockQuantity.
 * Returns the updated product for Socket.io broadcast.
 *
 * @param {string} rfid
 * @param {number} weight  — raw weight in grams or kg depending on unit
 * @returns {Object} updated product
 */
const updateWeightByRFID = async (rfid, weight) => {
  const product = await Product.findOne({ rfid: rfid.toUpperCase(), isActive: true });

  if (!product) {
    const err = new Error(`No active product found with RFID: ${rfid}`);
    err.statusCode = 404;
    throw err;
  }

  product.currentWeight = weight;
  // stockQuantity derived from weight (same units as price/unit)
  product.stockQuantity = weight;
  product.lastUpdatedByIoT = new Date();
  await product.save();

  logger.info(`IoT update — RFID: ${rfid}, weight: ${weight}, product: ${product.name}`);
  return product;
};

/**
 * Get all products with low stock.
 */
const getLowStockProducts = async () => {
  const products = await Product.find({ isActive: true }).populate('location', 'name');
  return products.filter((p) => p.isLowStock);
};

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  updateWeightByRFID,
  getLowStockProducts,
};
