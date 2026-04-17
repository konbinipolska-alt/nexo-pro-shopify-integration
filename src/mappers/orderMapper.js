function mapShopifyOrderToNexo(shopifyOrder) {
  const customer = shopifyOrder.billing_address || shopifyOrder.shipping_address || {};
  return {
    externalId: String(shopifyOrder.id),
    source: 'shopify',
    date: shopifyOrder.created_at,
    customer: {
      name: `${customer.first_name || ''} ${customer.last_name || ''}`.trim(),
      email: shopifyOrder.email,
      phone: customer.phone || '',
      address: { street: customer.address1 || '', city: customer.city || '', postCode: customer.zip || '', country: customer.country_code || '' },
    },
    items: shopifyOrder.line_items.map(item => ({
      sku: item.sku, name: item.title, quantity: item.quantity,
      unitPriceGross: parseFloat(item.price),
      taxRate: item.tax_lines?.[0]?.rate ? item.tax_lines[0].rate * 100 : 23,
    })),
    payment: { method: shopifyOrder.payment_gateway || 'other', totalGross: parseFloat(shopifyOrder.total_price), currency: shopifyOrder.currency },
    shipping: {
      method: shopifyOrder.shipping_lines?.[0]?.title || '',
      costGross: parseFloat(shopifyOrder.total_shipping_price_set?.shop_money?.amount || 0),
      address: { name: `${shopifyOrder.shipping_address?.first_name || ''} ${shopifyOrder.shipping_address?.last_name || ''}`.trim(), street: shopifyOrder.shipping_address?.address1 || '', city: shopifyOrder.shipping_address?.city || '', postCode: shopifyOrder.shipping_address?.zip || '', country: shopifyOrder.shipping_address?.country_code || '' },
    },
  };
}
module.exports = { mapShopifyOrderToNexo };
