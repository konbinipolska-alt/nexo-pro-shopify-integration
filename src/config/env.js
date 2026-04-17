const REQUIRED_ENV_VARS = [
  'SHOPIFY_SHOP_DOMAIN',
  'SHOPIFY_ACCESS_TOKEN',
  'SHOPIFY_WEBHOOK_SECRET',
  'NEXO_API_URL',
  'NEXO_API_TOKEN',
  'REDIS_URL',
];

const POSITIVE_INTEGER_ENV_VARS = [
  'PORT',
  'INVENTORY_SYNC_EVERY_MS',
  'INVENTORY_MAX_UPDATES_PER_RUN',
  'INVENTORY_PRODUCT_PAGE_SIZE',
];

function validateEnv() {
  const missing = REQUIRED_ENV_VARS.filter((name) => !process.env[name]);
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }

  for (const name of POSITIVE_INTEGER_ENV_VARS) {
    if (!process.env[name]) {
      continue;
    }

    const value = Number(process.env[name]);
    if (!Number.isInteger(value) || value <= 0) {
      throw new Error(`Environment variable ${name} must be a positive integer`);
    }
  }
}

module.exports = { validateEnv };
