const {getCore, setupPlugins, postsetupPlugins} = require('./config');
const setupMiddleware = require('./middleware');
const setupRoutes = require('./routes');

// get user core
const core = getCore();

// run initial setup
core.setup();

// setup function, returns express app
const setup = async () => {
  await setupPlugins(core);
  setupMiddleware(core);
  setupRoutes(core);
  await postsetupPlugins(core);
  return core.postSetup();
};
exports.setup = setup;

// start function, starts server
const start = async (port = 8080) => {
  await setup();
  core.start(port);
};
exports.start = start;
