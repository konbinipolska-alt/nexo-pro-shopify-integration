jest.mock('../../src/adapters/nexo/client', () => ({
  getStockLevels: jest.fn(),
}));

jest.mock('../../src/adapters/shopify/client', () => ({
  updateInventoryLevel: jest.fn(),
  shopifyClient: {
    get: jest.fn(),
  },
}));

jest.mock('../../src/mappers/inventoryMapper', () => ({
  mapNexoStockToShopify: jest.fn(),
}));

const { getStockLevels } = require('../../src/adapters/nexo/client');
const { updateInventoryLevel, shopifyClient } = require('../../src/adapters/shopify/client');
const { mapNexoStockToShopify } = require('../../src/mappers/inventoryMapper');
const { buildSkuMap, syncInventory } = require('../../src/services/inventorySync');

beforeEach(() => {
  jest.clearAllMocks();
  process.env.SHOPIFY_LOCATION_ID = 'loc-1';
  process.env.NEXO_WAREHOUSE_ID = '1';
});

test('builds sku map from Shopify products response', async () => {
  shopifyClient.get.mockResolvedValue({
    data: {
      products: [
        { variants: [{ sku: 'SKU-1', inventory_item_id: 1001 }, { sku: '', inventory_item_id: 1002 }] },
      ],
    },
  });

  const map = await buildSkuMap('loc-1', 100);

  expect(shopifyClient.get).toHaveBeenCalledWith('/products.json', { params: { limit: 100 } });
  expect(map.get('SKU-1')).toEqual({ inventoryItemId: 1001, locationId: 'loc-1' });
  expect(map.has('')).toBe(false);
});

test('applies inventory updates with max per run limit', async () => {
  process.env.INVENTORY_MAX_UPDATES_PER_RUN = '1';
  getStockLevels.mockResolvedValue([{ sku: 'SKU-1', quantity: 4 }]);
  shopifyClient.get.mockResolvedValue({ data: { products: [] } });
  mapNexoStockToShopify.mockReturnValue([
    { inventoryItemId: 1001, locationId: 'loc-1', available: 4 },
    { inventoryItemId: 1002, locationId: 'loc-1', available: 2 },
  ]);
  updateInventoryLevel.mockResolvedValue({});

  const result = await syncInventory();

  expect(updateInventoryLevel).toHaveBeenCalledTimes(1);
  expect(result).toEqual({ updated: 1, skippedByLimit: 1, maxUpdatesPerRun: 1 });
});

test('throws when SHOPIFY_LOCATION_ID is missing', async () => {
  delete process.env.SHOPIFY_LOCATION_ID;

  await expect(syncInventory()).rejects.toThrow(/SHOPIFY_LOCATION_ID/);
});
