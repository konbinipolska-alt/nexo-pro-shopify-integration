const { mapNexoStockToShopify } = require('../../src/mappers/inventoryMapper');

test('maps only SKUs existing in Shopify map', () => {
  const nexoStock = [
    { sku: 'ABC-1', quantity: 10.8 },
    { sku: 'MISSING', quantity: 5 },
  ];
  const skuMap = new Map([
    ['ABC-1', { inventoryItemId: 101, locationId: 'loc-1' }],
  ]);

  const result = mapNexoStockToShopify(nexoStock, skuMap);

  expect(result).toEqual([
    { sku: 'ABC-1', inventoryItemId: 101, locationId: 'loc-1', available: 10 },
  ]);
});

test('clamps negative quantities to zero', () => {
  const nexoStock = [{ sku: 'ABC-1', quantity: -2 }];
  const skuMap = new Map([
    ['ABC-1', { inventoryItemId: 101, locationId: 'loc-1' }],
  ]);

  const result = mapNexoStockToShopify(nexoStock, skuMap);

  expect(result[0].available).toBe(0);
});
