# NEXO Pro <-> Shopify Integration

Node.js service that synchronizes orders and inventory between Shopify and NEXO Pro.

## Features

- Receives Shopify `orders/paid` webhooks and enqueues async processing jobs.
- Imports paid orders into NEXO Pro with idempotency (`jobId = order-{shopifyOrderId}`).
- Runs periodic inventory sync from NEXO Pro to Shopify inventory levels.
- Uses BullMQ + Redis for reliable background processing.
- Includes unit tests for order mapping.

## Tech Stack

- Node.js 20+
- Express
- BullMQ + Redis
- Axios
- Jest

## Quick Start

1. Install dependencies:

```bash
npm install
```

2. Copy environment config:

```bash
cp .env.example .env
```

3. Fill required variables in `.env`:
   - `SHOPIFY_SHOP_DOMAIN`
   - `SHOPIFY_ACCESS_TOKEN`
   - `SHOPIFY_WEBHOOK_SECRET`
   - `NEXO_API_URL`
   - `NEXO_API_TOKEN`
   - `REDIS_URL`

4. Run Redis locally (or point `REDIS_URL` to your instance).

5. Start the app:

```bash
npm run dev
```

## Available Scripts

- `npm run dev` - start with nodemon
- `npm start` - start once
- `npm test` - run tests
- `npm run test:unit` - run unit tests
- `npm run lint` - run eslint

## Webhook Endpoint

- `POST /webhooks/orders/paid`
- Requires valid Shopify HMAC signature (`x-shopify-hmac-sha256`)

## Health Check

- `GET /health` -> `{ "status": "ok" }`

## Notes

- Inventory sync schedule is controlled by `INVENTORY_SYNC_EVERY_MS` (default: `300000`, i.e. 5 minutes).
- Architecture and setup details are available in `docs/architektura.md` and `docs/konfiguracja.md`.