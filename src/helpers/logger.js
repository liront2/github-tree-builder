const bunyan = require('bunyan');
const { SERVICE_NAME, LOG_LEVEL } = require('./environmentVariables');

module.exports = bunyan.createLogger({
  name: SERVICE_NAME,
  level: LOG_LEVEL
})
