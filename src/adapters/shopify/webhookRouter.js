const express = require('express');
const crypto = require('crypto');
const { orderQueue } = require('../../workers/queues');
const { createLogger } = require('../../utils/logger');
const router = express.Router();
const logger = createLogger('webhook');

function verifyWebhook(req, res, next) {
 const receivedHmac = req.headers['x-shopify-hmac-sha256'];
 const secret = process.env.SHOPIFY_WEBHOOK_SECRET;
 if (!receivedHmac || !secret || !req.rawBody) {
  logger.warn('Webhook validation failed: missing signature data');
  return res.status(401).send('Unauthorized');
 }

 const hash = crypto.createHmac('sha256', secret).update(req.rawBody).digest('base64');
 const hashBuffer = Buffer.from(hash);
 const receivedBuffer = Buffer.from(receivedHmac);
 if (hashBuffer.length !== receivedBuffer.length) {
  logger.warn('Webhook signature mismatch');
  return res.status(401).send('Unauthorized');
 }

 const isValid = crypto.timingSafeEqual(hashBuffer, receivedBuffer);
 if (!isValid) {
  logger.warn('Webhook signature mismatch');
  return res.status(401).send('Unauthorized');
 }

 return next();
}

router.post('/orders/paid', verifyWebhook, async (req, res) => {
 try {
  const order = req.body;
  if (!order?.id) {
   return res.status(400).json({ error: 'Missing order.id in payload' });
  }

  logger.info('Received orders/paid webhook', { orderId: order.id });
  await orderQueue.add(
   'import-order',
   { shopifyOrderId: order.id },
   { jobId: `order-${order.id}`, attempts: 5, backoff: { type: 'exponential', delay: 2000 } },
  );

  return res.sendStatus(200);
 } catch (err) {
  logger.error('Failed to enqueue order import', { error: err.message });
  return res.status(500).json({ error: 'Failed to enqueue order import' });
 }
});
module.exports = { webhookRouter: router };
