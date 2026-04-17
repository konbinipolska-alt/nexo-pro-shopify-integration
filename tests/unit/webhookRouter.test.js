const crypto = require('crypto');
const express = require('express');
const request = require('supertest');

jest.mock('../../src/workers/queues', () => ({
  orderQueue: {
    add: jest.fn(),
  },
}));

const { orderQueue } = require('../../src/workers/queues');
const { webhookRouter } = require('../../src/adapters/shopify/webhookRouter');

function buildApp() {
  const app = express();
  app.use(express.json({ verify: (req, _res, buf) => { req.rawBody = buf; } }));
  app.use('/webhooks', webhookRouter);
  return app;
}

function buildHmac(payload, secret) {
  return crypto.createHmac('sha256', secret).update(Buffer.from(JSON.stringify(payload))).digest('base64');
}

beforeEach(() => {
  jest.clearAllMocks();
  process.env.SHOPIFY_WEBHOOK_SECRET = 'test-secret';
});

test('returns 401 for invalid webhook signature', async () => {
  const app = buildApp();
  const response = await request(app)
    .post('/webhooks/orders/paid')
    .set('x-shopify-hmac-sha256', 'invalid-signature')
    .send({ id: 1 });

  expect(response.status).toBe(401);
  expect(orderQueue.add).not.toHaveBeenCalled();
});

test('returns 400 when payload does not contain order id', async () => {
  const app = buildApp();
  const payload = { foo: 'bar' };
  const hmac = buildHmac(payload, process.env.SHOPIFY_WEBHOOK_SECRET);

  const response = await request(app)
    .post('/webhooks/orders/paid')
    .set('x-shopify-hmac-sha256', hmac)
    .send(payload);

  expect(response.status).toBe(400);
  expect(orderQueue.add).not.toHaveBeenCalled();
});

test('enqueues job for valid signed payload', async () => {
  orderQueue.add.mockResolvedValue({ id: 'job-1' });
  const app = buildApp();
  const payload = { id: 777 };
  const hmac = buildHmac(payload, process.env.SHOPIFY_WEBHOOK_SECRET);

  const response = await request(app)
    .post('/webhooks/orders/paid')
    .set('x-shopify-hmac-sha256', hmac)
    .send(payload);

  expect(response.status).toBe(200);
  expect(orderQueue.add).toHaveBeenCalledWith(
    'import-order',
    { shopifyOrderId: 777 },
    { jobId: 'order-777', attempts: 5, backoff: { type: 'exponential', delay: 2000 } },
  );
});
