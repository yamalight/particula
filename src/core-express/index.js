const helmet = require('helmet');
const express = require('express');
const bodyParser = require('body-parser');
const errorhandler = require('errorhandler');

// init express app
const app = express();

// core metadata
exports.server = app;
exports.name = 'particula-core-express';

// setup scripts
exports.setup = () => {
  // body parsing (POST/PUT support)
  app.use(bodyParser.urlencoded({extended: false}));
  app.use(bodyParser.json());

  // enable helmet with defaults
  app.use(helmet());

  return app;
};

// plugin setup script
exports.setupPlugin = async plugin => {
  const pluginData = await plugin.setup(app);
  app.set(plugin.name, pluginData);
};
exports.postsetupPlugin = plugin => plugin.postsetup(app);

exports.setupMiddleware = middlewareHandler => {
  app.use(middlewareHandler);
};

// postsetup script
exports.postSetup = async () => {
  // Handle 404
  app.use((req, res, next) => {
    res.status(404).send(`Route ${req.url} Not found.`);
  });

  // only use in development
  console.log(process.env.NODE_ENV);
  if (process.env.NODE_ENV !== 'production') {
    app.use(errorhandler());
  } else {
    // Render error for production
    app.use((err, req, res, next) => {
      /* eslint handle-callback-err: off */
      res.status(500).send('500: Internal Server Error');
    });
  }

  return app;
};

// start scripts
exports.start = (port = 8080) => {
  app.listen(port, () => console.log(`Started at ${port}`));
};

/**
 * Routes handling
 */

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

// loads given file into router
exports.applyFile = ({routeName, filePath}) => {
  const routeHandler = require(filePath);

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
const loadRoute = ({routeName, routeHandler, filePath, routeType}) => {
  const router = express.Router();

  if (routeType === 'esm') {
    router.get(routeName, asyncWrapper(routeHandler.default));
    return router;
  }

  if (routeType === 'module') {
    router.get(routeName, asyncWrapper(routeHandler));
    return router;
  }

  if (routeType === 'router') {
    router.app = app;
    routeHandler.useRouter(router);
    return router;
  }

  if (routeType === 'methods') {
    Object.keys(routeHandler).forEach(method => {
      router[method](routeName, asyncWrapper(routeHandler[method]));
    });
    return router;
  }
};

exports.loadRoutes = routes => {
  // load routes into memory
  for (const route of routes) {
    const router = loadRoute(route);
    routesMap[route.routeName] = {router, register: undefined};
  }

  // add routes to express
  registerRoutes(app);
};

exports.hotReload = {
  add({routeName, routeHandler, filePath, routeType}) {
    routesMap[routeName] = {router: dummyRouter, register: undefined};
    const router = loadRoute({routeName, routeHandler, filePath, routeType});
    routesMap[routeName].router = router;
    registerRoutes(app);
  },
  change({routeName, routeHandler, filePath, routeType}) {
    const router = loadRoute({routeName, routeHandler, filePath, routeType});
    routesMap[routeName].router = router;
    registerRoutes(app);
  },
  delete(routeName) {
    routesMap[routeName].router = dummyRouter;
  },
};
