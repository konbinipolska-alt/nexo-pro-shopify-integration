const { getOrder } = require('../adapters/shopify/client');
const { createSalesDocument } = require('../adapters/nexo/client');
const { mapShopifyOrderToNexo } = require('../mappers/orderMapper');

async function processOrderImport(shopifyOrderId) {
  const shopifyOrder = await getOrder(shopifyOrderId);
  const nexoPayload = mapShopifyOrderToNexo(shopifyOrder);
  const nexoDocument = await createSalesDocument(nexoPayload);

  return { nexoDocumentId: nexoDocument.id };
}

module.exports = { processOrderImport };
