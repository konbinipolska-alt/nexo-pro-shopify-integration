require('dotenv').config();
const express = require('express');
const { validateEnv } = require('./config/env');
const { createLogger } = require('./utils/logger');
const { webhookRouter } = require('./adapters/shopify/webhookRouter');
const { startWorkers, stopWorkers } = require('./workers');
const { closeQueues } = require('./workers/queues');
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

let server;
let shuttingDown = false;

async function shutdown(signal) {
  if (shuttingDown) {
    return;
  }

  shuttingDown = true;
  logger.info('Shutdown started', { signal });
  try {
    if (server) {
      await new Promise((resolve, reject) => {
        server.close((err) => {
          if (err) {
            reject(err);
            return;
          }
          resolve();
        });
      });
    }
    await stopWorkers();
    await closeQueues();
    logger.info('Shutdown complete');
    process.exit(0);
  } catch (err) {
    logger.error('Shutdown failed', { message: err.message });
    process.exit(1);
  }
}

async function main() {
  validateEnv();
  await startWorkers();
  server = app.listen(PORT, () => logger.info(`Server running on port ${PORT}`));
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled promise rejection', { reason: reason?.message || String(reason) });
});
process.on('uncaughtException', (err) => {
  logger.error('Uncaught exception', { message: err.message, stack: err.stack });
  shutdown('uncaughtException');
});

main().catch((err) => {
  logger.error('Application bootstrap failed', { message: err.message, stack: err.stack });
  process.exit(1);
});
