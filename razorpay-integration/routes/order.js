const express = require('express');
const router = express.Router();
const razorpay = require('../config/razorpay');
const Order = require('../models/Order');
const { authenticate } = require('../middleware/auth');

router.post('/create', authenticate, async (req, res) => {
  try {
    const { amount, currency = 'INR', receipt, serviceId, notes } = req.body;

    // Validation
    if (!amount || typeof amount !== 'number' || amount <= 0) {
      return res.status(400).json({ error: 'Invalid amount. Must be a positive number (in rupees).' });
    }

    if (amount > 100000) {
      return res.status(400).json({ error: 'Amount exceeds maximum limit of ₹1,00,000' });
    }

    // Convert rupees to paise
    const amountInPaise = Math.round(amount * 100);
    const receiptId = receipt || `filenova_${Date.now()}_${req.user.id.slice(-6)}`;

    // Create order with Razorpay
    const razorpayOrder = await razorpay.orders.create({
      amount: amountInPaise,
      currency,
      receipt: receiptId,
      notes: {
        userId: req.user.id.toString(),
        serviceId: serviceId || '',
        source: 'filenova.in',
        ...notes
      }
    });

    // Save to database
    const order = await Order.create({
      userId: req.user.id,
      serviceId,
      razorpayOrderId: razorpayOrder.id,
      amount: amountInPaise,
      currency,
      status: 'created',
      receipt: receiptId,
      notes: { source: 'filenova.in' }
    });

    res.status(201).json({
      success: true,
      orderId: razorpayOrder.id,
      amount: amountInPaise,
      currency,
      receipt: receiptId,
      key: process.env.RAZORPAY_KEY_ID
    });
  } catch (error) {
    console.error('Order creation error:', error);
    res.status(500).json({
      error: 'Failed to create order',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

router.get('/status/:orderId', authenticate, async (req, res) => {
  try {
    const order = await Order.findOne({
      razorpayOrderId: req.params.orderId,
      userId: req.user.id
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json({
      success: true,
      order: {
        id: order.razorpayOrderId,
        status: order.status,
        amount: order.amount,
        currency: order.currency,
        createdAt: order.createdAt,
        paidAt: order.paidAt
      }
    });
  } catch (error) {
    console.error('Order status error:', error);
    res.status(500).json({ error: 'Failed to fetch order status' });
  }
});

module.exports = router;
