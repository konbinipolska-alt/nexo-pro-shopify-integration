const { validateEnv } = require('../../src/config/env');

const REQUIRED_KEYS = [
  'SHOPIFY_SHOP_DOMAIN',
  'SHOPIFY_ACCESS_TOKEN',
  'SHOPIFY_WEBHOOK_SECRET',
  'NEXO_API_URL',
  'NEXO_API_TOKEN',
  'REDIS_URL',
];

const backupEnv = { ...process.env };

afterEach(() => {
  process.env = { ...backupEnv };
});

test('passes when all required env vars are present', () => {
  for (const key of REQUIRED_KEYS) {
    process.env[key] = 'value';
  }

  expect(() => validateEnv()).not.toThrow();
});

test('throws when required env var is missing', () => {
  for (const key of REQUIRED_KEYS) {
    process.env[key] = 'value';
  }
  delete process.env.NEXO_API_TOKEN;

  expect(() => validateEnv()).toThrow(/NEXO_API_TOKEN/);
});

test('throws when PORT is not a positive integer', () => {
  for (const key of REQUIRED_KEYS) {
    process.env[key] = 'value';
  }
  process.env.PORT = 'abc';

  expect(() => validateEnv()).toThrow(/PORT/);
});
