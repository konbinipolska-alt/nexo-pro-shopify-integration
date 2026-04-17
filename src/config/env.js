const REQUIRED_ENV_VARS = [
  'SHOPIFY_SHOP_DOMAIN',
  'SHOPIFY_ACCESS_TOKEN',
  'SHOPIFY_WEBHOOK_SECRET',
  'NEXO_API_URL',
  'NEXO_API_TOKEN',
  'REDIS_URL',
];

function validateEnv() {
  const missing = REQUIRED_ENV_VARS.filter((name) => !process.env[name]);
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
}

module.exports = { validateEnv };
