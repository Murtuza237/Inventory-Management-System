const inventoryService = require('../services/inventoryService');
const notificationService = require('../services/notificationService');
const { getIO } = require('../sockets/inventorySocket');

const getAllProducts = async (req, res, next) => {
  try {
    const { locationId } = req.query;
    const products = await inventoryService.getAllProducts(locationId);
    res.status(200).json({ success: true, count: products.length, products });
  } catch (error) {
    next(error);
  }
};

const getProduct = async (req, res, next) => {
  try {
    const product = await inventoryService.getProductById(req.params.id);
    res.status(200).json({ success: true, product });
  } catch (error) {
    next(error);
  }
};

const createProduct = async (req, res, next) => {
  try {
    const product = await inventoryService.createProduct(req.body);
    // Broadcast new product to all connected clients
    getIO().emit('inventory:product_added', product);
    res.status(201).json({ success: true, product });
  } catch (error) {
    next(error);
  }
};

const updateProduct = async (req, res, next) => {
  try {
    const product = await inventoryService.updateProduct(req.params.id, req.body);
    getIO().emit('inventory:product_updated', product);
    res.status(200).json({ success: true, product });
  } catch (error) {
    next(error);
  }
};

const deleteProduct = async (req, res, next) => {
  try {
    await inventoryService.deleteProduct(req.params.id);
    getIO().emit('inventory:product_deleted', { id: req.params.id });
    res.status(200).json({ success: true, message: 'Product deactivated' });
  } catch (error) {
    next(error);
  }
};

/**
 * IoT endpoint — POST /api/iot/update
 * Accepts { rfid, weight } from ESP32
 */
const iotWeightUpdate = async (req, res, next) => {
  try {
    const { rfid, weight } = req.body;
    const product = await inventoryService.updateWeightByRFID(rfid, weight);

    // Real-time broadcast to all connected clients
    const io = getIO();
    io.emit('inventory:weight_update', {
      productId: product._id,
      rfid: product.rfid,
      name: product.name,
      currentWeight: product.currentWeight,
      stockQuantity: product.stockQuantity,
      isLowStock: product.isLowStock,
      lastUpdatedByIoT: product.lastUpdatedByIoT,
    });

    // Low-stock alert: create notification + emit event
    if (product.isLowStock) {
      io.emit('inventory:low_stock_alert', {
        productId: product._id,
        name: product.name,
        currentWeight: product.currentWeight,
        lowStockThreshold: product.lowStockThreshold,
      });

      // Persist a low-stock notification
      await notificationService.createNotification({
        type: 'low_stock',
        title: `Low Stock: ${product.name}`,
        message: `${product.name} is at ${product.currentWeight} ${product.unit} (threshold: ${product.lowStockThreshold})`,
        product: product._id,
        location: product.location,
      });
    }

    res.status(200).json({ success: true, product });
  } catch (error) {
    next(error);
  }
};

const getLowStock = async (req, res, next) => {
  try {
    const products = await inventoryService.getLowStockProducts();
    res.status(200).json({ success: true, count: products.length, products });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  iotWeightUpdate,
  getLowStock,
};
