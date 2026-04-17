const { getStockLevels } = require('../adapters/nexo/client');
const { updateInventoryLevel, shopifyClient } = require('../adapters/shopify/client');
const { mapNexoStockToShopify } = require('../mappers/inventoryMapper');

async function buildSkuMap(locationId, pageSize = 250) {
  const map = new Map();
  const { data } = await shopifyClient.get('/products.json', { params: { limit: pageSize } });
  for (const product of data.products) {
    for (const variant of product.variants) {
      if (variant.sku) {
        map.set(variant.sku, { inventoryItemId: variant.inventory_item_id, locationId });
      }
    }
  }
  return map;
}

async function syncInventory() {
  const locationId = process.env.SHOPIFY_LOCATION_ID;
  const warehouseId = process.env.NEXO_WAREHOUSE_ID;
  const maxUpdatesPerRun = Number(process.env.INVENTORY_MAX_UPDATES_PER_RUN || 500);
  const pageSize = Number(process.env.INVENTORY_PRODUCT_PAGE_SIZE || 250);

  if (!locationId) {
    throw new Error('SHOPIFY_LOCATION_ID is required for inventory sync');
  }

  const [nexoStock, skuMap] = await Promise.all([
    getStockLevels(warehouseId),
    buildSkuMap(locationId, pageSize),
  ]);
  const updates = mapNexoStockToShopify(nexoStock, skuMap);
  const limitedUpdates = updates.slice(0, maxUpdatesPerRun);

  for (const item of limitedUpdates) {
    await updateInventoryLevel(item.inventoryItemId, item.locationId, item.available);
  }

  return {
    updated: limitedUpdates.length,
    skippedByLimit: Math.max(0, updates.length - limitedUpdates.length),
    maxUpdatesPerRun,
  };
}

module.exports = { buildSkuMap, syncInventory };
