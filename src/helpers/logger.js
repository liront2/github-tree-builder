const bunyan = require('bunyan');
const { SERVICE_NAME } = require('./environmentVariables');

module.exports = bunyan.createLogger({name: SERVICE_NAME})
