const express = require('express');
const crypto = require('crypto');
const { orderQueue } = require('../../workers/queues');
const { createLogger } = require('../../utils/logger');
const router = express.Router();
const logger = createLogger('webhook');
function verifyWebhook(req, res, next) {
  const hmac = req.headers['x-shopify-hmac-sha256'];
  const hash = crypto.createHmac('sha256', process.env.SHOPIFY_WEBHOOK_SECRET).update(req.rawBody).digest('base64');
  if (hash !== hmac) { logger.warn('Webhook signature mismatch'); return res.status(401).send('Unauthorized'); }
  next();
}
router.post('/orders/paid', verifyWebhook, async (req, res) => {
  const order = req.body;
  logger.info('Received orders/paid webhook', { orderId: order.id });
  await orderQueue.add('import-order', { shopifyOrderId: order.id }, { jobId: `order-${order.id}`, attempts: 5, backoff: { type: 'exponential', delay: 2000 } });
  res.sendStatus(200);
});
module.exports = { webhookRouter: router };
