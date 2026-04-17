const { orderWorker } = require('./orderWorker');
const { inventoryWorker } = require('./inventoryWorker');
const { createLogger } = require('../utils/logger');
const logger = createLogger('workers');
async function startWorkers() { logger.info('Workers started', { workers: ['order-worker', 'inventory-worker'] }); }
module.exports = { startWorkers, orderWorker, inventoryWorker };
