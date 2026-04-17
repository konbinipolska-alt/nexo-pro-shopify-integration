require('dotenv').config();
const express = require('express');
const { createLogger } = require('./utils/logger');
const { webhookRouter } = require('./adapters/shopify/webhookRouter');
const { startWorkers } = require('./workers');
const logger = createLogger('app');
const app = express();
app.use(express.json({ verify: (req, _res, buf) => { req.rawBody = buf; } }));
app.get('/health', (_req, res) => res.json({ status: 'ok' }));
app.use('/webhooks', webhookRouter);
const PORT = process.env.PORT || 3000;
async function main() {
  await startWorkers();
  app.listen(PORT, () => logger.info(`Server running on port ${PORT}`));
}
main().catch(err => { console.error(err); process.exit(1); });
