const axios = require('axios');
const shopifyClient = axios.create({
  baseURL: `https://${process.env.SHOPIFY_SHOP_DOMAIN}/admin/api/${process.env.SHOPIFY_API_VERSION || '2024-10'}`,
  headers: { 'X-Shopify-Access-Token': process.env.SHOPIFY_ACCESS_TOKEN, 'Content-Type': 'application/json' },
});
shopifyClient.interceptors.response.use(res => res, async err => {
  if (err.response?.status === 429) {
    const retryAfter = parseInt(err.response.headers['retry-after'] || '2', 10);
    await new Promise(r => setTimeout(r, retryAfter * 1000));
    return shopifyClient.request(err.config);
  }
  return Promise.reject(err);
});
async function getOrder(orderId) {
  const { data } = await shopifyClient.get(`/orders/${orderId}.json`);
  return data.order;
}
async function updateInventoryLevel(inventoryItemId, locationId, available) {
  const { data } = await shopifyClient.post('/inventory_levels/set.json', { inventory_item_id: inventoryItemId, location_id: locationId, available });
  return data.inventory_level;
}
async function createFulfillment(orderId, payload) {
  const { data } = await shopifyClient.post(`/orders/${orderId}/fulfillments.json`, { fulfillment: payload });
  return data.fulfillment;
}
module.exports = { shopifyClient, getOrder, updateInventoryLevel, createFulfillment };
