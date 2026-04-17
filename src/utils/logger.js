const winston = require('winston');
function createLogger(service) {
  return winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
    defaultMeta: { service },
    transports: [new winston.transports.Console()],
  });
}
module.exports = { createLogger };
