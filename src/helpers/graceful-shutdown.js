'use strict';

const gracefulShutdown = require('graceful-shutdown-express');

const { NEW_CONNECTIONS_TIMEOUT, SHUTDOWN_TIMEOUT } = require('./environmentVariables');
const logger = require('./logger');

/**
 * register system events for gracefulShutdown
 */
// TODO: should add a logger to the project (winston / bunyan)
module.exports = (server, events) => {
  gracefulShutdown.registerShutdownEvent({
    server,
    newConnectionsTimeout: NEW_CONNECTIONS_TIMEOUT,
    shutdownTimeout: SHUTDOWN_TIMEOUT,
    events,
    logger,
    callback: async() => logger.info('Closed all server connections successfully')
  });
};
