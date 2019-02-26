const helmet = require('helmet');
const express = require('express');
const bodyParser = require('body-parser');
const {setupPlugins, postsetupPlugins} = require('./config');
const setupMiddleware = require('./middleware');
const setupRoutes = require('./routes');

// init express app
const app = express();

// body parsing (POST/PUT support)
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

// enable helmet with defaults
app.use(helmet());

// setup function, returns express app
const setup = async () => {
  await setupPlugins(app);
  setupMiddleware(app);
  setupRoutes(app);
  await postsetupPlugins(app);
  return app;
};
exports.setup = setup;

// CLI config

exports.command = '*';
exports.describe = 'start server';
exports.builder = {
  port: {
    alias: 'p',
    description: 'Start server at specified port',
    type: 'number',
  }
}

exports.handler = async ({ port = 8080 }) => {
  if (isNaN(port)) {
    console.error('Invalid port');
    process.exit(1);
  }
  start(port);
};

// start function, starts server
const start = async (port = 8080) => {
  await setup();
  app.listen(port, () => console.log(`Started at ${port}`));
};
exports.start = start;
