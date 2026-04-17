const { Worker } = require('bullmq');
const { getStockLevels } = require('../adapters/nexo/client');
const { updateInventoryLevel, shopifyClient } = require('../adapters/shopify/client');
const { mapNexoStockToShopify } = require('../mappers/inventoryMapper');
const { createLogger } = require('../utils/logger');
const { connection } = require('./queues');
const logger = createLogger('inventory-worker');
async function buildSkuMap() {
  const locationId = process.env.SHOPIFY_LOCATION_ID;
  const map = new Map();
  const { data } = await shopifyClient.get('/products.json', { params: { limit: 250 } });
  for (const product of data.products)
    for (const variant of product.variants)
      if (variant.sku) map.set(variant.sku, { inventoryItemId: variant.inventory_item_id, locationId });
  return map;
}
const inventoryWorker = new Worker('inventory', async job => {
  logger.info('Starting inventory sync', { jobId: job.id });
  const [nexoStock, skuMap] = await Promise.all([getStockLevels(process.env.NEXO_WAREHOUSE_ID), buildSkuMap()]);
  const updates = mapNexoStockToShopify(nexoStock, skuMap);
  for (const item of updates) await updateInventoryLevel(item.inventoryItemId, item.locationId, item.available);
  logger.info('Inventory sync complete', { updated: updates.length });
  return { updated: updates.length };
}, { connection, concurrency: 1 });
inventoryWorker.on('failed', (job, err) => logger.error('Inventory sync failed', { jobId: job?.id, error: err.message }));
module.exports = { inventoryWorker };
