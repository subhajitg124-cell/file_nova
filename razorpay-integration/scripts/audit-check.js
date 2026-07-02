const crypto = require('crypto');
const Razorpay = require('razorpay');
require('dotenv').config();

async function runAudit() {
  console.log('🔍 Starting Filenova Payment Audit...\n');

  // 1. Check environment variables
  console.log('1️⃣  Checking environment variables...');
  const required = ['RAZORPAY_KEY_ID', 'RAZORPAY_KEY_SECRET', 'RAZORPAY_WEBHOOK_SECRET'];
  required.forEach((key) => {
    const value = process.env[key];
    if (!value) {
      console.log(`   ❌ Missing: ${key}`);
    } else {
      console.log(`   ✅ Found: ${key} (${value.substring(0, 15)}...)`);
    }
  });

  // 2. Validate key format
  console.log('\n2️⃣  Validating key format...');
  const keyId = process.env.RAZORPAY_KEY_ID;
  if (keyId?.startsWith('rzp_test_')) {
    console.log('   ✅ Test mode detected');
  } else if (keyId?.startsWith('rzp_live_')) {
    console.log('   ⚠️  LIVE mode - be careful!');
  } else {
    console.log('   ❌ Invalid key format');
  }

  // 3. Test Razorpay API connection
  console.log('\n3️⃣  Testing Razorpay API connection...');
  try {
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET
    });
    await razorpay.orders.fetch({ count: 1 });
    console.log('   ✅ API connection successful');
  } catch (error) {
    console.log('   ❌ API connection failed:', error.message);
  }

  // 4. Test signature generation
  console.log('\n4️⃣  Testing signature generation...');
  try {
    const testPayload = '{"test": "data"}';
    const signature = crypto
      .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET)
      .update(testPayload)
      .digest('hex');
    console.log(`   ✅ Signature generation works: ${signature.substring(0, 20)}...`);
  } catch (error) {
    console.log('   ❌ Signature generation failed:', error.message);
  }

  // 5. Check webhook URL format
  console.log('\n5️⃣  Webhook endpoint check...');
  console.log('   📌 Ensure webhook URL in Razorpay Dashboard is:');
  console.log('      https://filenova.in/api/v1/webhook/razorpay');
  console.log('   📌 For local testing, use ngrok:');
  console.log('      ngrok http 5000');

  console.log('\n✨ Audit complete!');
}

runAudit();
