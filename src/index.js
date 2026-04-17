require('dotenv').config();
const express = require('express');
const { validateEnv } = require('./config/env');
const { createLogger } = require('./utils/logger');
const { webhookRouter } = require('./adapters/shopify/webhookRouter');
const { startWorkers } = require('./workers');
const logger = createLogger('app');
const app = express();
app.use(express.json({ verify: (req, _res, buf) => { req.rawBody = buf; } }));
app.get('/health', (_req, res) => res.json({ status: 'ok' }));
app.use('/webhooks', webhookRouter);
app.use((err, _req, res, _next) => {
  logger.error('Unhandled application error', { message: err.message, stack: err.stack });
  res.status(500).json({ error: 'Internal server error' });
});
const PORT = process.env.PORT || 3000;
async function main() {
 validateEnv();
  await startWorkers();
  app.listen(PORT, () => logger.info(`Server running on port ${PORT}`));
}
main().catch(err => { console.error(err); process.exit(1); });
