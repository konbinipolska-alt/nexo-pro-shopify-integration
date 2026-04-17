const { Queue } = require('bullmq');
const IORedis = require('ioredis');
const connection = new IORedis(process.env.REDIS_URL || 'redis://localhost:6379', { maxRetriesPerRequest: null });
const orderQueue = new Queue('orders', { connection });
const inventoryQueue = new Queue('inventory', { connection });
module.exports = { orderQueue, inventoryQueue, connection };
