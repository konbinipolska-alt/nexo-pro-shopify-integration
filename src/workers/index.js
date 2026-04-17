const { orderWorker } = require('./orderWorker');
const { inventoryWorker } = require('./inventoryWorker');
const { inventoryQueue } = require('./queues');
const { createLogger } = require('../utils/logger');
const logger = createLogger('workers');

async function scheduleInventorySync() {
  const everyMs = Number(process.env.INVENTORY_SYNC_EVERY_MS || 300000);
  await inventoryQueue.add(
    'sync-inventory',
    {},
    {
      repeat: { every: everyMs },
      jobId: 'inventory-sync-repeatable',
      removeOnComplete: 100,
      removeOnFail: 100,
    },
  );
  logger.info('Scheduled inventory sync job', { everyMs });
}

async function startWorkers() {
  await scheduleInventorySync();
  logger.info('Workers started', { workers: ['order-worker', 'inventory-worker'] });
}

async function stopWorkers() {
  await Promise.all([
    orderWorker.close(),
    inventoryWorker.close(),
  ]);
  logger.info('Workers stopped');
}

module.exports = { startWorkers, stopWorkers, orderWorker, inventoryWorker };
