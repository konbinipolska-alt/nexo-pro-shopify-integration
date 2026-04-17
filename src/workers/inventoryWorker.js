const { Worker } = require('bullmq');
const { syncInventory } = require('../services/inventorySync');
const { createLogger } = require('../utils/logger');
const { connection } = require('./queues');
const logger = createLogger('inventory-worker');
const inventoryWorker = new Worker('inventory', async job => {
  logger.info('Starting inventory sync', { jobId: job.id });
  const result = await syncInventory();
  logger.info('Inventory sync complete', result);
  return result;
}, { connection, concurrency: 1 });
inventoryWorker.on('failed', (job, err) => logger.error('Inventory sync failed', { jobId: job?.id, error: err.message }));
module.exports = { inventoryWorker };
