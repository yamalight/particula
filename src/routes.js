const fs = require('fs');
const path = require('path');
const {routesPath} = require('./config');
const {fileNameToRoute, getFiles, detectRouteType} = require('./util');
const setupHotReload = require('./hotreload');

const filesToRoutes = routesFiles =>
  routesFiles.map(fileName => {
    const routeName = fileNameToRoute(fileName);
    const filePath = path.join(routesPath, fileName);
    const routeHandler = require(filePath);
    const routeType = detectRouteType(filePath);
    return {routeName, routeHandler, filePath, routeType};
  });

// loads and sets up all user routes
const setupRoutes = core => {
  // if middleware path doesn't exist - throw an error
  if (!fs.existsSync(routesPath)) {
    throw new Error(`Routes path doesn't exist! Please create routes/ folder.`);
  }

  // get files list
  const routesFiles = getFiles(routesPath);

  // setup routes with hot reload if not running in production
  if (process.env.NODE_ENV !== 'production') {
    const routes = filesToRoutes(routesFiles);
    core.loadRoutes(routes);
    // setup hot reload
    return setupHotReload(core);
  }

  // when running in production
  // load routes into server directly
  for (const fileName of routesFiles) {
    const routeName = fileNameToRoute(fileName);
    const filePath = path.join(routesPath, fileName);
    core.applyFile({routeName, filePath});
  }
};

module.exports = setupRoutes;
