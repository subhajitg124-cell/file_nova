const requiredVars = [
  'RAZORPAY_KEY_ID',
  'RAZORPAY_KEY_SECRET',
  'RAZORPAY_WEBHOOK_SECRET',
  'MONGODB_URI',
  'JWT_SECRET'
];

let hasError = false;

requiredVars.forEach((varName) => {
  if (!process.env[varName]) {
    console.error(`❌ Missing required environment variable: ${varName}`);
    hasError = true;
  }
});

const keyId = process.env.RAZORPAY_KEY_ID;
if (keyId && !keyId.startsWith('rzp_')) {
  console.error('❌ Invalid RAZORPAY_KEY_ID format');
  hasError = true;
}

const isTestMode = keyId && keyId.startsWith('rzp_test_');
const isLiveMode = keyId && keyId.startsWith('rzp_live_');

if (isTestMode) {
  console.log('⚠️  Running in TEST MODE');
} else if (isLiveMode) {
  console.log('🔴 Running in LIVE MODE - Real money transactions active!');
}

if (process.env.RAZORPAY_KEY_SECRET === process.env.RAZORPAY_WEBHOOK_SECRET) {
  console.error('❌ KEY_SECRET and WEBHOOK_SECRET must be different values');
  hasError = true;
}

if (hasError && process.env.NODE_ENV === 'production') {
  process.exit(1);
}

module.exports = { isTestMode, isLiveMode };
