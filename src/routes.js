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

const loadFile = (app, fileName) => {
  const fileBaseName = fileName.replace(/\.js$/, '');
  const routeName = fileBaseName === 'index' ? '/' : `/${fileBaseName.toLowerCase()}`;
  const routeHandler = require(path.join(routesPath, fileName));

  if (typeof routeHandler.default === 'function') {
    app.get(routeName, routeHandler.default);
    return;
  }

  if (typeof routeHandler === 'function') {
    app.get(routeName, routeHandler);
    return;
  }

  if (routeHandler.useRouter && typeof routeHandler.useRouter === 'function') {
    app.use(wrapMiddleware(app, routeHandler.useRouter));
    return;
  }

  const allowedMethods = ['put', 'get', 'post', 'delete'];
  const methods = Object.keys(routeHandler);
  if (!methods.some(method => allowedMethods.includes(method))) {
    throw new Error(`Route definition doesn't match possible formats`);
  }

  methods.forEach(method => {
    app[method](routeName, routeHandler[method]);
  });
};

// loads and sets up all user routes
const setupRoutes = app => {
  // if middleware path doesn't exist - throw an error
  if (!fs.existsSync(routesPath)) {
    throw new Error(`Routes path doesn't exist! Please create routes/ folder.`);
  }
  // load routes
  const routesFiles = fs.readdirSync(routesPath);
  for (const fileName of routesFiles) {
    loadFile(app, fileName);
  }
};

module.exports = setupRoutes;
