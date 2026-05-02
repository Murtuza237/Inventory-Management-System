const mongoose = require('mongoose');
const Transaction = require('../models/Transaction');
const Product = require('../models/Product');
const logger = require('../utils/logger');

/**
 * Create a billing transaction.
 * Atomically reduces stock for each item using a MongoDB session.
 *
 * @param {Array}  items      - [{ productId, quantity }]
 * @param {string} paymentMethod
 * @param {number} discount
 * @param {string} createdBy  - user ObjectId
 * @param {string} notes
 * @returns {Object} saved transaction
 */
const createTransaction = async ({ items, paymentMethod, discount = 0, createdBy, notes }) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const lineItems = [];
    let totalAmount = 0;

    for (const item of items) {
      const product = await Product.findById(item.productId).session(session);
      if (!product || !product.isActive) {
        throw Object.assign(new Error(`Product not found: ${item.productId}`), { statusCode: 404 });
      }

      if (product.stockQuantity < item.quantity) {
        throw Object.assign(
          new Error(`Insufficient stock for "${product.name}". Available: ${product.stockQuantity}`),
          { statusCode: 409 }
        );
      }

      const subtotal = parseFloat((product.price * item.quantity).toFixed(2));
      totalAmount += subtotal;

      lineItems.push({
        product: product._id,
        productName: product.name,
        rfid: product.rfid,
        quantity: item.quantity,
        unit: product.unit,
        pricePerUnit: product.price,
        subtotal,
      });

      // Atomically reduce stock
      product.stockQuantity -= item.quantity;
      product.currentWeight -= item.quantity;
      if (product.currentWeight < 0) product.currentWeight = 0;
      await product.save({ session });
    }

    const finalAmount = parseFloat((totalAmount - discount).toFixed(2));

    const [transaction] = await Transaction.create(
      [
        {
          items: lineItems,
          totalAmount: parseFloat(totalAmount.toFixed(2)),
          discount,
          finalAmount,
          paymentMethod,
          createdBy,
          notes,
          status: 'completed',
        },
      ],
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    logger.info(`Transaction ${transaction.invoiceNumber} created by ${createdBy}`);
    return transaction;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

/**
 * Get paginated transactions.
 */
const getTransactions = async ({ page = 1, limit = 20, startDate, endDate } = {}) => {
  const filter = {};
  if (startDate || endDate) {
    filter.createdAt = {};
    if (startDate) filter.createdAt.$gte = new Date(startDate);
    if (endDate) filter.createdAt.$lte = new Date(endDate);
  }

  const [transactions, total] = await Promise.all([
    Transaction.find(filter)
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit)),
    Transaction.countDocuments(filter),
  ]);

  return { transactions, total, page: Number(page), limit: Number(limit) };
};

/**
 * Get a single transaction by ID.
 */
const getTransactionById = async (id) => {
  const tx = await Transaction.findById(id).populate('createdBy', 'name email');
  if (!tx) {
    throw Object.assign(new Error('Transaction not found'), { statusCode: 404 });
  }
  return tx;
};

/**
 * Daily sales summary (total revenue, number of transactions).
 */
const getDailySummary = async (date) => {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  const end = new Date(date);
  end.setHours(23, 59, 59, 999);

  const result = await Transaction.aggregate([
    { $match: { createdAt: { $gte: start, $lte: end }, status: 'completed' } },
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: '$finalAmount' },
        transactionCount: { $sum: 1 },
      },
    },
  ]);

  return result[0] || { totalRevenue: 0, transactionCount: 0 };
};

module.exports = { createTransaction, getTransactions, getTransactionById, getDailySummary };
