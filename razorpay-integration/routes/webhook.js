const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const ProcessedEvent = require('../models/ProcessedEvent');
const { verifyWebhookSignature } = require('../utils/signature');
const { logWebhook } = require('../utils/webhookLogger');

// CRITICAL: Use raw body parser for webhook endpoint ONLY
router.post(
  '/razorpay',
  express.raw({ type: 'application/json', limit: '1mb' }),
  async (req, res) => {
    const signature = req.headers['x-razorpay-signature'];
    const eventId = req.headers['x-razorpay-event-id'];

    // 1. Verify signature FIRST
    const isValid = verifyWebhookSignature(
      req.body,
      signature,
      process.env.RAZORPAY_WEBHOOK_SECRET
    );

    if (!isValid) {
      logWebhook(null, 'INVALID_SIGNATURE', {
        eventId,
        receivedSignature: signature,
        bodyLength: req.body?.length
      });
      // Return 200 to stop retries, but don't process
      return res.status(200).json({ status: 'invalid_signature' });
    }

    // 2. Parse body AFTER verification
    let event;
    try {
      event = JSON.parse(req.body.toString('utf8'));
    } catch (parseError) {
      logWebhook(null, 'PARSE_ERROR', { eventId, error: parseError.message });
      return res.status(200).json({ status: 'parse_error' });
    }

    // 3. Idempotency check
    try {
      const existingEvent = await ProcessedEvent.findOne({ eventId });
      if (existingEvent) {
        logWebhook(event, 'DUPLICATE');
        return res.status(200).json({ status: 'duplicate' });
      }
    } catch (dbError) {
      console.error('Idempotency check failed:', dbError);
    }

    // 4. Process the event
    try {
      await handleWebhookEvent(event);

      // 5. Mark as processed
      await ProcessedEvent.create({
        eventId,
        eventType: event.event,
        paymentId: event.payload?.payment?.entity?.id,
        orderId: event.payload?.payment?.entity?.order_id
      });

      logWebhook(event, 'SUCCESS');
      return res.status(200).json({ status: 'ok' });
    } catch (processingError) {
      console.error('Webhook processing error:', processingError);
      logWebhook(event, 'PROCESSING_ERROR', { error: processingError.message });
      // Return 200 to prevent infinite retries; log for manual review
      return res.status(200).json({ status: 'error', message: processingError.message });
    }
  }
);

async function handleWebhookEvent(event) {
  const eventType = event.event;
  const payload = event.payload;

  switch (eventType) {
    case 'payment.authorized':
      await handlePaymentAuthorized(payload.payment.entity);
      break;
    case 'payment.captured':
      await handlePaymentCaptured(payload.payment.entity);
      break;
    case 'payment.failed':
      await handlePaymentFailed(payload.payment.entity);
      break;
    case 'refund.processed':
      await handleRefundProcessed(payload.refund.entity);
      break;
    case 'order.paid':
      await handleOrderPaid(payload.order.entity);
      break;
    default:
      console.log(`Unhandled event type: ${eventType}`);
  }
}

async function handlePaymentAuthorized(payment) {
  await Order.findOneAndUpdate(
    { razorpayOrderId: payment.order_id },
    {
      $set: {
        status: 'authorized',
        razorpayPaymentId: payment.id,
        paymentMethod: payment.method
      }
    }
  );
}

async function handlePaymentCaptured(payment) {
  const order = await Order.findOneAndUpdate(
    { razorpayOrderId: payment.order_id },
    {
      $set: {
        status: 'captured',
        razorpayPaymentId: payment.id,
        paymentMethod: payment.method,
        paidAt: new Date(),
        notes: payment.notes
      }
    },
    { new: true }
  );

  if (!order) {
    throw new Error(`Order not found for razorpayOrderId: ${payment.order_id}`);
  }

  // Trigger post-payment actions (fire-and-forget)
  triggerPostPaymentActions(order).catch((err) =>
    console.error('Post-payment action error:', err)
  );
}

async function handlePaymentFailed(payment) {
  await Order.findOneAndUpdate(
    { razorpayOrderId: payment.order_id },
    {
      $set: {
        status: 'failed',
        razorpayPaymentId: payment.id,
        failureReason: payment.error_description || 'Payment failed'
      }
    }
  );
}

async function handleRefundProcessed(refund) {
  await Order.findOneAndUpdate(
    { razorpayPaymentId: refund.payment_id },
    {
      $set: { status: 'refunded' }
    }
  );
}

async function handleOrderPaid(orderEntity) {
  // Order.paid is fired when all payments for an order are captured
  await Order.findOneAndUpdate(
    { razorpayOrderId: orderEntity.id },
    { $set: { status: 'captured' } }
  );
}

async function triggerPostPaymentActions(order) {
  // TODO: Implement your business logic here
  // Examples:
  // - Send confirmation email
  // - Unlock premium service
  // - Update user credits
  // - Notify admin
  console.log(`🎉 Post-payment actions for order ${order.razorpayOrderId}`);
}

module.exports = router;
