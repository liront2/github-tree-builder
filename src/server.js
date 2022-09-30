// const gracefulShutdown = require('./helpers/graceful-shutdown');
// const logger = require('./helpers/logger');
const _app = require('./app');
const { PORT, SERVER_KEEP_ALIVE } = require('./helpers/environmentVariables');

_app().then(app => {
  const server = app.listen(PORT, function() {
    console.log('Github tree builder service is listening on port %d (http://localhost:%d)', PORT, PORT)
  });

  server.keepAliveTimeout = SERVER_KEEP_ALIVE;

  // Graceful Shutdown
  // gracefulShutdown.registerShutdownEvent({
  //   server: server,
  //   newConnectionsTimeout: serviceConfig.newConnectionsTimeout,
  //   shutdownTimeout: serviceConfig.shutdownTimeout,
  //   events: ['SIGINT', 'SIGTERM'],
  //   logger: logger,
  //   callback: gracefulShutdownCallback
  // });
  // gracefulShutdown.register(server, ['SIGTERM', 'SIGINT']);
}).catch(function(error) {
  console.error('Could not start Github tree builder service', error);
  process.exit(1);
});

process.on('error', function(error) {
  console.error(error);
});
process.on('unhandledRejection', function(error, p) {
  console.error(error);
});
process.on('uncaughtException', function(error) {
  console.error(error);
});
