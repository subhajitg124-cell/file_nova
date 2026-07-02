const crypto = require('crypto');

/**
 * Verify Razorpay webhook signature
 * @param {Buffer|string} rawBody - Raw request body
 * @param {string} signature - Signature from x-razorpay-signature header
 * @param {string} secret - Webhook secret
 * @returns {boolean}
 */
function verifyWebhookSignature(rawBody, signature, secret) {
  if (!rawBody || !signature || !secret) {
    return false;
  }

  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(typeof rawBody === 'string' ? rawBody : rawBody.toString('utf8'))
    .digest('hex');

  // Constant-time comparison to prevent timing attacks
  if (expectedSignature.length !== signature.length) {
    return false;
  }

  let result = 0;
  for (let i = 0; i < expectedSignature.length; i++) {
    result |= expectedSignature.charCodeAt(i) ^ signature.charCodeAt(i);
  }

  return result === 0;
}

/**
 * Verify payment signature (for frontend callback verification)
 * @param {string} orderId
 * @param {string} paymentId
 * @param {string} signature
 * @param {string} secret - Key secret (NOT webhook secret)
 * @returns {boolean}
 */
function verifyPaymentSignature(orderId, paymentId, signature, secret) {
  const message = `${orderId}|${paymentId}`;
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(message)
    .digest('hex');

  return expectedSignature === signature;
}

module.exports = { verifyWebhookSignature, verifyPaymentSignature };
