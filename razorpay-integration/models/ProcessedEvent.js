const mongoose = require('mongoose');

const processedEventSchema = new mongoose.Schema(
  {
    eventId: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    eventType: { type: String, required: true },
    paymentId: { type: String },
    orderId: { type: String },
    processedAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

// TTL index - auto-delete after 30 days
processedEventSchema.index({ processedAt: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 });

module.exports = mongoose.model('ProcessedEvent', processedEventSchema);
