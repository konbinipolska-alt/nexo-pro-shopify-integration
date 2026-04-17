function mapNexoStockToShopify(nexoStockItems, skuToShopifyMap) {
  return nexoStockItems.filter(item => skuToShopifyMap.has(item.sku)).map(item => {
    const { inventoryItemId, locationId } = skuToShopifyMap.get(item.sku);
    return { inventoryItemId, locationId, available: Math.max(0, Math.floor(item.quantity)), sku: item.sku };
  });
}
module.exports = { mapNexoStockToShopify };
