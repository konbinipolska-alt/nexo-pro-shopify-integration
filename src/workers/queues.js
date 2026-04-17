const { Queue } = require('bullmq');
const IORedis = require('ioredis');
const connection = new IORedis(process.env.REDIS_URL || 'redis://localhost:6379', { maxRetriesPerRequest: null });
const orderQueue = new Queue('orders', { connection });
const inventoryQueue = new Queue('inventory', { connection });

async function closeQueues() {
  await Promise.all([
    orderQueue.close(),
    inventoryQueue.close(),
  ]);
  await connection.quit();
}

module.exports = { orderQueue, inventoryQueue, connection, closeQueues };
