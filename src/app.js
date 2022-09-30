const express = require('express');
const controller = require('./controller/builderTreeController');
const errorHandler = require('./middlewares/error-handler');

module.exports = async() => {
  const app = express();
  app.disable('x-powered-by');

  app.get('/health', (req, res) => res.json({ status: 'UP' }));
  app.use(express.json({ limit: '1mb'}))
  
  app.get('/owners/:owner_name/repos/:repo_name/tree', controller);
  app.use(errorHandler.handleRouteNotFoundError);
  app.use(errorHandler.handleError);

  return app;
};
