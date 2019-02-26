const fs = require('fs');
const path = require('path');
const express = require('express');
const {routesPath} = require('./config');

// wraps user router files into a new router instance
const wrapMiddleware = (app, fn) => {
  const router = express.Router();
  router.getData = app.get.bind(app);
  fn(router);
  return router;
};

// loads and sets up all user routes
const setupRoutes = app => {
  // load routes
  const routesFiles = fs.readdirSync(routesPath);
  for (const fileName of routesFiles) {
    const fileBaseName = fileName.replace(/\.js$/, '');
    const routeName = fileBaseName === 'index' ? '/' : `/${fileBaseName.toLowerCase()}`;
    const routeHandler = require(path.join(routesPath, fileName));

    if (typeof routeHandler.default === 'function') {
      app.get(routeName, routeHandler.default);
    } else if (typeof routeHandler === 'function') {
      app.get(routeName, routeHandler);
    } else if (routeHandler.useRouter && typeof routeHandler.useRouter === 'function') {
      app.use(wrapMiddleware(app, routeHandler.useRouter));
    } else if (
      routeHandler.type &&
      typeof routeHandler.type === 'string' &&
      routeHandler.handler &&
      typeof routeHandler.handler === 'function'
    ) {
      app[routeHandler.type](routeName, routeHandler.handler);
    } else {
      throw new Error(`Route definition doesn't match possible formats`);
    }
  }
};

module.exports = setupRoutes;
