const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    serviceId: { type: String },
    razorpayOrderId: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    razorpayPaymentId: { type: String, index: true },
    amount: { type: Number, required: true }, // in paise
    currency: { type: String, default: 'INR' },
    status: {
      type: String,
      enum: ['created', 'authorized', 'captured', 'failed', 'refunded', 'pending'],
      default: 'created',
      index: true
    },
    paymentMethod: { type: String },
    receipt: { type: String },
    failureReason: { type: String },
    paidAt: { type: Date },
    notes: { type: mongoose.Schema.Types.Mixed }
  },
  { timestamps: true }
);

orderSchema.index({ createdAt: -1 });
orderSchema.index({ userId: 1, status: 1 });

module.exports = mongoose.model('Order', orderSchema);
