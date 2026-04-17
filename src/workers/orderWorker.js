const { Worker } = require('bullmq');
const { getOrder } = require('../adapters/shopify/client');
const { createSalesDocument } = require('../adapters/nexo/client');
const { mapShopifyOrderToNexo } = require('../mappers/orderMapper');
const { createLogger } = require('../utils/logger');
const { connection } = require('./queues');
const logger = createLogger('order-worker');
const orderWorker = new Worker('orders', async job => {
  const { shopifyOrderId } = job.data;
  logger.info('Processing order import', { shopifyOrderId, jobId: job.id });
  const shopifyOrder = await getOrder(shopifyOrderId);
  const nexoPayload = mapShopifyOrderToNexo(shopifyOrder);
  const nexoDocument = await createSalesDocument(nexoPayload);
  logger.info('Order imported to NEXO', { shopifyOrderId, nexoDocumentId: nexoDocument.id });
  return { nexoDocumentId: nexoDocument.id };
}, { connection, concurrency: 5 });
orderWorker.on('failed', (job, err) => logger.error('Order import failed', { jobId: job?.id, error: err.message }));
module.exports = { orderWorker };
