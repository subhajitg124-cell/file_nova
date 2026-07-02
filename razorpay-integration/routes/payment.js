const express = require('express');
const router = express.Router();
const razorpay = require('../config/razorpay');
const { verifyPaymentSignature } = require('../utils/signature');
const { authenticate } = require('../middleware/auth');
const Order = require('../models/Order');

// Verify payment signature from frontend callback
router.post('/verify', authenticate, async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ error: 'Missing required payment details' });
    }

    // Verify signature
    const isValid = verifyPaymentSignature(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      process.env.RAZORPAY_KEY_SECRET
    );

    if (!isValid) {
      return res.status(400).json({ verified: false, error: 'Payment verification failed' });
    }

    // Fetch payment details from Razorpay
    const payment = await razorpay.payments.fetch(razorpay_payment_id);

    // Update local order record
    await Order.findOneAndUpdate(
      { razorpayOrderId: razorpay_order_id, userId: req.user.id },
      {
        $set: {
          razorpayPaymentId: razorpay_payment_id,
          status: payment.status === 'captured' ? 'captured' : 'authorized',
          paymentMethod: payment.method
        }
      }
    );

    res.json({
      verified: true,
      payment: {
        id: payment.id,
        status: payment.status,
        method: payment.method,
        amount: payment.amount,
        captured: payment.status === 'captured'
      }
    });
  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({ error: 'Verification failed' });
  }
});

// Fetch payment details
router.get('/:paymentId', authenticate, async (req, res) => {
  try {
    const payment = await razorpay.payments.fetch(req.params.paymentId);
    res.json({ success: true, payment });
  } catch (error) {
    console.error('Fetch payment error:', error);
    res.status(500).json({ error: 'Failed to fetch payment' });
  }
});

module.exports = router;
