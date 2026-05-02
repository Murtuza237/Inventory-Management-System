const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
      maxlength: 100,
    },
    rfid: {
      type: String,
      required: [true, 'RFID tag is required'],
      unique: true,
      uppercase: true,
      trim: true,
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
    },
    unit: {
      type: String,
      enum: ['kg', 'g', 'piece', 'litre', 'ml'],
      default: 'kg',
    },
    category: {
      type: String,
      trim: true,
      default: 'General',
    },
    // Current weight measured by IoT load cell
    currentWeight: {
      type: Number,
      default: 0,
      min: 0,
    },
    // Expected full weight (max capacity on the scale)
    maxWeight: {
      type: Number,
      default: 100,
      min: 0,
    },
    // Minimum weight threshold for low-stock alert
    lowStockThreshold: {
      type: Number,
      default: 10,
    },
    // Computed stock quantity from latest IoT reading
    stockQuantity: {
      type: Number,
      default: 0,
      min: 0,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    image: {
      type: String,
      trim: true,
    },
    location: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Location',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    // Timestamp of last IoT update
    lastUpdatedByIoT: {
      type: Date,
    },
  },
  { timestamps: true }
);

// Virtual: is this product low on stock?
productSchema.virtual('isLowStock').get(function () {
  return this.currentWeight <= this.lowStockThreshold;
});

productSchema.set('toJSON', { virtuals: true });
productSchema.set('toObject', { virtuals: true });

// Index for fast RFID lookups (IoT hot path)
productSchema.index({ rfid: 1 });
productSchema.index({ isActive: 1 });
productSchema.index({ location: 1 });

module.exports = mongoose.model('Product', productSchema);
