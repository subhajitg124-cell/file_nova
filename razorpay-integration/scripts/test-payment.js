const assert = require('assert');
const crypto = require('crypto');
const { verifyWebhookSignature, verifyPaymentSignature } = require('../utils/signature');

console.log('🧪 Starting Razorpay Integration Unit Tests...\n');

// Test 1: Webhook Signature Verification with valid signature
try {
  console.log('Test 1: Webhook Signature Verification (Valid Signature)');
  const secret = 'webhook_secret_123';
  const rawBody = JSON.stringify({ event: 'payment.captured', id: 'evt_123' });
  
  const signature = crypto
    .createHmac('sha256', secret)
    .update(rawBody)
    .digest('hex');

  const result = verifyWebhookSignature(rawBody, signature, secret);
  assert.strictEqual(result, true, 'Valid signature should verify successfully');
  console.log('   ✅ Passed');
} catch (err) {
  console.error('   ❌ Failed:', err.message);
  process.exit(1);
}

// Test 2: Webhook Signature Verification with invalid signature
try {
  console.log('Test 2: Webhook Signature Verification (Invalid Signature)');
  const secret = 'webhook_secret_123';
  const rawBody = JSON.stringify({ event: 'payment.captured', id: 'evt_123' });
  const signature = 'invalid_signature_here';

  const result = verifyWebhookSignature(rawBody, signature, secret);
  assert.strictEqual(result, false, 'Invalid signature should fail verification');
  console.log('   ✅ Passed');
} catch (err) {
  console.error('   ❌ Failed:', err.message);
  process.exit(1);
}

// Test 3: Payment Signature Verification (Frontend Callback)
try {
  console.log('Test 3: Payment Signature Verification (Valid Signature)');
  const keySecret = 'key_secret_abc';
  const orderId = 'order_def456';
  const paymentId = 'pay_ghi789';
  
  const expectedSignature = crypto
    .createHmac('sha256', keySecret)
    .update(`${orderId}|${paymentId}`)
    .digest('hex');

  const result = verifyPaymentSignature(orderId, paymentId, expectedSignature, keySecret);
  assert.strictEqual(result, true, 'Valid payment signature should verify successfully');
  console.log('   ✅ Passed');
} catch (err) {
  console.error('   ❌ Failed:', err.message);
  process.exit(1);
}

// Test 4: Payment Signature Verification with mismatch
try {
  console.log('Test 4: Payment Signature Verification (Signature Mismatch)');
  const keySecret = 'key_secret_abc';
  const orderId = 'order_def456';
  const paymentId = 'pay_ghi789';
  const signature = 'mismatched_sig';

  const result = verifyPaymentSignature(orderId, paymentId, signature, keySecret);
  assert.strictEqual(result, false, 'Mismatched payment signature should fail verification');
  console.log('   ✅ Passed');
} catch (err) {
  console.error('   ❌ Failed:', err.message);
  process.exit(1);
}

console.log('\n✨ All unit tests passed successfully!');
