const mongoose = require('mongoose');

const transactionItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    productName: { type: String, required: true }, // Snapshot at time of sale
    rfid: { type: String, required: true },
    quantity: { type: Number, required: true, min: 0.001 },
    unit: { type: String, required: true },
    pricePerUnit: { type: Number, required: true, min: 0 },
    subtotal: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const transactionSchema = new mongoose.Schema(
  {
    invoiceNumber: {
      type: String,
      unique: true,
    },
    items: {
      type: [transactionItemSchema],
      required: true,
      validate: {
        validator: (v) => v.length > 0,
        message: 'A transaction must have at least one item',
      },
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    discount: {
      type: Number,
      default: 0,
      min: 0,
    },
    finalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    paymentMethod: {
      type: String,
      enum: ['cash', 'card', 'upi', 'other'],
      default: 'cash',
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'cancelled', 'refunded'],
      default: 'completed',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    notes: { type: String, trim: true },
  },
  { timestamps: true }
);

// Auto-generate invoice number before saving
transactionSchema.pre('save', async function (next) {
  if (!this.isNew) return next();
  const count = await mongoose.model('Transaction').countDocuments();
  this.invoiceNumber = `INV-${String(count + 1).padStart(6, '0')}`;
  next();
});

transactionSchema.index({ createdAt: -1 });
transactionSchema.index({ createdBy: 1 });
transactionSchema.index({ invoiceNumber: 1 });

module.exports = mongoose.model('Transaction', transactionSchema);
