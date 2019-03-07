const chokidar = require('chokidar');
const {routesPath} = require('./config');
const {fileNameToRoute, detectRouteType} = require('./util');

// sets up hot reload for routes
const setupHotReload = core => {
  // do not setup hot reload when running in testing mode
  if (process.env.NODE_ENV === 'testing') {
    return;
  }
  // do not setup hot reload when core doesn't support it
  if (!core.hotReload) {
    return;
  }

  const watcher = chokidar.watch(routesPath, {ignoreInitial: true});

  watcher
    .on('add', filePath => {
      try {
        const fileName = filePath.replace(routesPath, '');
        const routeName = fileNameToRoute(fileName);
        const routeType = detectRouteType(filePath);
        const routeHandler = require(filePath);
        const newRoute = {routeName, routeHandler, filePath, routeType};
        core.hotReload.add(newRoute);
        console.log(`File ${fileName} has been added, loaded new route ${routeName}`);
      } catch (e) {
        console.error('Error adding new route:', e);
      }
    })
    .on('change', filePath => {
      try {
        const fileName = filePath.replace(routesPath, '');
        const routeName = fileNameToRoute(fileName);
        // delete cached required script
        delete require.cache[filePath];
        // load new version
        const routeType = detectRouteType(filePath);
        const routeHandler = require(filePath);
        core.hotReload.change({routeName, routeHandler, filePath, routeType});
        console.log(`File ${fileName} has been change, updated existing route ${routeName}`);
      } catch (e) {
        console.error('Error updating route:', e);
      }
    })
    .on('unlink', filePath => {
      try {
        const fileName = filePath.replace(routesPath, '');
        const routeName = fileNameToRoute(fileName);
        core.hotReload.delete(routeName);
        delete require.cache[filePath];
        console.log(`File ${fileName} has been removed, removed existing route ${routeName}`);
      } catch (e) {
        console.error('Error removing route:', e);
      }
    });

  return watcher;
};

module.exports = setupHotReload;
