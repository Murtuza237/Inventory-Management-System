const billingService = require('../services/billingService');
const { getIO } = require('../sockets/inventorySocket');

const createTransaction = async (req, res, next) => {
  try {
    const { items, paymentMethod, discount, notes } = req.body;
    const transaction = await billingService.createTransaction({
      items,
      paymentMethod,
      discount,
      createdBy: req.user._id,
      notes,
    });

    // Notify all clients a sale occurred (triggers inventory refresh)
    getIO().emit('billing:transaction_created', {
      invoiceNumber: transaction.invoiceNumber,
      finalAmount: transaction.finalAmount,
      itemCount: transaction.items.length,
    });

    res.status(201).json({ success: true, transaction });
  } catch (error) {
    next(error);
  }
};

const getTransactions = async (req, res, next) => {
  try {
    const result = await billingService.getTransactions(req.query);
    res.status(200).json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};

const getTransaction = async (req, res, next) => {
  try {
    const transaction = await billingService.getTransactionById(req.params.id);
    res.status(200).json({ success: true, transaction });
  } catch (error) {
    next(error);
  }
};

const getDailySummary = async (req, res, next) => {
  try {
    const date = req.query.date || new Date().toISOString().split('T')[0];
    const summary = await billingService.getDailySummary(date);
    res.status(200).json({ success: true, date, summary });
  } catch (error) {
    next(error);
  }
};

module.exports = { createTransaction, getTransactions, getTransaction, getDailySummary };
