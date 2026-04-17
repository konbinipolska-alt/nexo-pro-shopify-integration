const { mapShopifyOrderToNexo } = require('../../src/mappers/orderMapper');
const sample = { id: 123, email: 'jan@test.pl', created_at: '2024-01-15T10:00:00Z', currency: 'PLN', total_price: '149.99', payment_gateway: 'przelewy24', billing_address: { first_name: 'Jan', last_name: 'Kowalski', address1: 'ul. Testowa 1', city: 'Warszawa', zip: '00-001', country_code: 'PL' }, shipping_address: { first_name: 'Jan', last_name: 'Kowalski', address1: 'ul. Testowa 1', city: 'Warszawa', zip: '00-001', country_code: 'PL' }, line_items: [{ sku: 'PROD-001', title: 'Produkt testowy', quantity: 2, price: '59.99', tax_lines: [{ rate: 0.23 }] }], shipping_lines: [{ title: 'InPost' }], total_shipping_price_set: { shop_money: { amount: '9.99' } } };
test('mapuje zamówienie Shopify na format NEXO Pro', () => {
  const r = mapShopifyOrderToNexo(sample);
  expect(r.externalId).toBe('123');
  expect(r.customer.name).toBe('Jan Kowalski');
  expect(r.items[0].sku).toBe('PROD-001');
  expect(r.items[0].taxRate).toBe(23);
});
