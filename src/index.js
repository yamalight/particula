const {setupApp, setupErrorHandling} = require('./express');
const {setupPlugins, postsetupPlugins} = require('./config');
const setupMiddleware = require('./middleware');
const setupRoutes = require('./routes');

// construct new server instance
const app = setupApp();

// setup function, returns express app
const setup = async () => {
  await setupPlugins(app);
  setupMiddleware(app);
  setupRoutes(app);
  setupErrorHandling(app);
  await postsetupPlugins(app);
  return app;
};
exports.setup = setup;

// start function, starts server
const start = async (port = 8080) => {
  await setup();
  app.listen(port, () => console.log(`Started at ${port}`));
};
exports.start = start;
