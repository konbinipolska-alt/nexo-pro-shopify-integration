const axios = require('axios');
const nexoClient = axios.create({
  baseURL: process.env.NEXO_API_URL,
  headers: { Authorization: `Bearer ${process.env.NEXO_API_TOKEN}`, 'Content-Type': 'application/json' },
  timeout: 15000,
});
async function createSalesDocument(payload) { const { data } = await nexoClient.post('/documents/sales', payload); return data; }
async function getStockLevels(warehouseId) { const { data } = await nexoClient.get(`/warehouses/${warehouseId}/stock`); return data; }
async function getPriceList(priceListId) { const { data } = await nexoClient.get(`/pricelists/${priceListId}`); return data; }
module.exports = { nexoClient, createSalesDocument, getStockLevels, getPriceList };
