const fs = require('fs');
const path = require('path');
const express = require('express');
const chokidar = require('chokidar');
const {routesPath} = require('./config');

// stored map of routes and corresponding routers
// used for hot swapping the modules in development
const routesMap = {};

// dummy router that does nothing
// user for failed route init and deleted routes
const dummyRouter = (req, res, next) => next();

const asyncWrapper = fn => (req, res, next) => {
  const fnReturn = fn(req, res, next);
  return Promise.resolve(fnReturn).catch(next);
};

// converts file name to route name
const fileNameToRoute = fileName => {
  const fileBaseName = fileName.replace(/\.js$/, '');
  const routeName = fileBaseName.toLowerCase().replace('index', '');
  return routeName.startsWith('/') ? routeName : `/${routeName}`;
};

// loads given file into router
const applyFile = (app, fileName) => {
  const routeName = fileNameToRoute(fileName);
  const routeHandler = require(path.join(routesPath, fileName));

  if (typeof routeHandler.default === 'function') {
    app.get(routeName, asyncWrapper(routeHandler.default));
    return;
  }

  if (typeof routeHandler === 'function') {
    app.get(routeName, asyncWrapper(routeHandler));
    return;
  }

  if (routeHandler.useRouter && typeof routeHandler.useRouter === 'function') {
    const router = express.Router();
    router.app = app;
    routeHandler.useRouter(router);
    app.use(router);
    return;
  }

  const allowedMethods = ['put', 'get', 'post', 'delete'];
  const methods = Object.keys(routeHandler);
  if (!methods.some(method => allowedMethods.includes(method))) {
    throw new Error(`Route definition doesn't match possible formats`);
  }

  methods.forEach(method => {
    app[method](routeName, asyncWrapper(routeHandler[method]));
  });
};

// loads given file into router
const loadFile = (app, fileName) => {
  const routeName = fileNameToRoute(fileName);
  const routeHandler = require(path.join(routesPath, fileName));

  const router = express.Router();

  if (typeof routeHandler.default === 'function') {
    router.get(routeName, asyncWrapper(routeHandler.default));
    return {router, routeName};
  }

  if (typeof routeHandler === 'function') {
    router.get(routeName, asyncWrapper(routeHandler));
    return {router, routeName};
  }

  if (routeHandler.useRouter && typeof routeHandler.useRouter === 'function') {
    router.app = app;
    routeHandler.useRouter(router);
    return {router, routeName};
  }

  const allowedMethods = ['put', 'get', 'post', 'delete'];
  const methods = Object.keys(routeHandler);
  if (!methods.some(method => allowedMethods.includes(method))) {
    throw new Error(`Route definition doesn't match possible formats`);
  }

  methods.forEach(method => {
    router[method](routeName, asyncWrapper(routeHandler[method]));
  });

  return {router, routeName};
};

// (re-)registers routes on the app when needed
const registerRoutes = app => {
  Object.keys(routesMap).forEach(route => {
    // skip already registered routes
    if (routesMap[route].register) {
      return;
    }
    // create new register function, indicates that route has been registered
    routesMap[route].register = (req, res, next) => routesMap[route].router(req, res, next);
    // use register function in server
    app.use(routesMap[route].register);
  });
};

// sets up hot reload for routes
const setupHotReload = app => {
  // do not setup hot reload when running in testing mode
  if (process.env.NODE_ENV === 'testing') {
    return;
  }

  const watcher = chokidar.watch(routesPath, {ignoreInitial: true});

  watcher
    .on('add', fullpath => {
      try {
        const fileName = fullpath.replace(routesPath, '');
        const routeName = fileNameToRoute(fileName);
        routesMap[routeName] = {router: dummyRouter, register: undefined};
        const {router} = loadFile(app, fileName);
        routesMap[routeName].router = router;
        registerRoutes(app);
        console.log(`File ${fileName} has been added, loaded new route ${routeName}`);
      } catch (e) {
        console.error('Error adding new route:', e);
      }
    })
    .on('change', fullpath => {
      try {
        const fileName = fullpath.replace(routesPath, '');
        // delete cached required script
        delete require.cache[fullpath];
        // load new version
        const {router, routeName} = loadFile(app, fileName);
        routesMap[routeName].router = router;
        registerRoutes(app);
        console.log(`File ${fileName} has been change, updated existing route ${routeName}`);
      } catch (e) {
        console.error('Error updating route:', e);
      }
    })
    .on('unlink', fullpath => {
      try {
        const fileName = fullpath.replace(routesPath, '');
        const routeName = fileNameToRoute(fileName);
        routesMap[routeName].router = dummyRouter;
        delete require.cache[fullpath];
        console.log(`File ${fileName} has been removed, removed existing route ${routeName}`);
      } catch (e) {
        console.error('Error removing route:', e);
      }
    });

  return watcher;
};

const getFiles = (folderpath, {base = '/'} = {}) =>
  [].concat.apply(
    [],
    fs.readdirSync(folderpath).map(filename => {
      const filepath = path.join(folderpath, filename);
      if (fs.lstatSync(filepath).isDirectory()) {
        return getFiles(filepath, {base: path.join(base, filename)});
      }

      return path.join(base, filename);
    })
  );

// loads and sets up all user routes
const setupRoutes = app => {
  // if middleware path doesn't exist - throw an error
  if (!fs.existsSync(routesPath)) {
    throw new Error(`Routes path doesn't exist! Please create routes/ folder.`);
  }

  // get files list
  const routesFiles = getFiles(routesPath);

  // setup routes with hot reload if not running in production
  if (process.env.NODE_ENV !== 'production') {
    // load routes into memory
    for (const fileName of routesFiles) {
      const {router, routeName} = loadFile(app, fileName);
      routesMap[routeName] = {router, register: undefined};
    }

    // add routes to express
    registerRoutes(app);

    // setup hot reload
    return setupHotReload(app);
  }

  // when running in production
  // load routes into server directly
  for (const fileName of routesFiles) {
    applyFile(app, fileName);
  }
};

module.exports = setupRoutes;
