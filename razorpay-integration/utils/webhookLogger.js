const fs = require('fs');
const path = require('path');

const LOG_DIR = path.join(__dirname, '../logs');

if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
}

const logWebhook = (event, status, details = {}) => {
  const logEntry = {
    timestamp: new Date().toISOString(),
    eventId: event?.id || details?.eventId,
    eventType: event?.event || details?.eventType,
    status,
    paymentId: event?.payload?.payment?.entity?.id,
    orderId: event?.payload?.payment?.entity?.order_id,
    amount: event?.payload?.payment?.entity?.amount,
    ...details
  };

  const logLine = JSON.stringify(logEntry);

  if (status === 'SUCCESS') {
    console.log(`✅ [WEBHOOK] ${logLine}`);
  } else if (status === 'DUPLICATE') {
    console.log(`⏭️  [WEBHOOK] ${logLine}`);
  } else if (status === 'INVALID_SIGNATURE') {
    console.error(`🚨 [WEBHOOK] ${logLine}`);
  } else {
    console.error(`❌ [WEBHOOK] ${logLine}`);
  }

  const logFile = path.join(LOG_DIR, 'webhooks.log');
  fs.appendFileSync(logFile, logLine + '\n');
};

module.exports = { logWebhook };
