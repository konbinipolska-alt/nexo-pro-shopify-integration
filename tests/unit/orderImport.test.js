jest.mock('../../src/adapters/shopify/client', () => ({
  getOrder: jest.fn(),
}));

jest.mock('../../src/adapters/nexo/client', () => ({
  createSalesDocument: jest.fn(),
}));

jest.mock('../../src/mappers/orderMapper', () => ({
  mapShopifyOrderToNexo: jest.fn(),
}));

const { getOrder } = require('../../src/adapters/shopify/client');
const { createSalesDocument } = require('../../src/adapters/nexo/client');
const { mapShopifyOrderToNexo } = require('../../src/mappers/orderMapper');
const { processOrderImport } = require('../../src/services/orderImport');

test('processes Shopify order and returns NEXO document id', async () => {
  const shopifyOrder = { id: 123 };
  const mappedPayload = { externalId: '123' };
  getOrder.mockResolvedValue(shopifyOrder);
  mapShopifyOrderToNexo.mockReturnValue(mappedPayload);
  createSalesDocument.mockResolvedValue({ id: 'NEXO-1' });

  const result = await processOrderImport(123);

  expect(getOrder).toHaveBeenCalledWith(123);
  expect(mapShopifyOrderToNexo).toHaveBeenCalledWith(shopifyOrder);
  expect(createSalesDocument).toHaveBeenCalledWith(mappedPayload);
  expect(result).toEqual({ nexoDocumentId: 'NEXO-1' });
});
