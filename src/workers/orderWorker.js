const { Worker } = require('bullmq');
const { processOrderImport } = require('../services/orderImport');
const { createLogger } = require('../utils/logger');
const { connection } = require('./queues');
const logger = createLogger('order-worker');
const orderWorker = new Worker('orders', async job => {
  const { shopifyOrderId } = job.data;
  logger.info('Processing order import', { shopifyOrderId, jobId: job.id });
  const result = await processOrderImport(shopifyOrderId);
  logger.info('Order imported to NEXO', { shopifyOrderId, nexoDocumentId: result.nexoDocumentId });
  return result;
}, { connection, concurrency: 5 });
orderWorker.on('failed', (job, err) => logger.error('Order import failed', { jobId: job?.id, error: err.message }));
module.exports = { orderWorker };
