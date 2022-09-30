// import buildTreeModel from "./model/builderModel";

const express = require('express');
const controller = require('./controller/builderTreeController');
// const errorHandler = require('./middlewares/error-handler');
// const logger = require('./helpers/logger');

// const env = require('./helpers/environment-variables')();
// const router = express.Router();
// router.route('/owners/:owner_name/repos/:repo_name/').get()

// owners/RaviKharatmal/test/branches/develop

module.exports = async() => {
  const app = express();
  app.disable('x-powered-by');

  // app.use('/', infraRoute);
  app.use(express.json({ limit: '1mb'}))
  
  app.get('/owners/:owner_name/repos/:repo_name/tree', controller);
  // app.use(errorHandler.handleRouteNotFoundError);
  // app.use(errorHandler.handleError);

  return app;
};
