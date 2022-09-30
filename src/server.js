const _app = require('./app');
const { PORT, SERVER_KEEP_ALIVE } = require('./helpers/environmentVariables');
const registerGracefulShutdownEvent = require('./helpers/graceful-shutdown');
const logger = require('./helpers/logger');

_app().then(app => {
  const server = app.listen(PORT, function() {
    logger.info('Github tree builder service is listening on port %d (http://localhost:%d)', PORT, PORT)
  });

  server.keepAliveTimeout = SERVER_KEEP_ALIVE;

  // Graceful Shutdown
  registerGracefulShutdownEvent(server,['SIGINT', 'SIGTERM']);
}).catch(function(error) {
  console.error('Could not start ' +
    'Github tree builder service', error);
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
