const fs = require('fs');
const path = require('path');
const {middlewarePath} = require('./config');

// sets up all user middleware files
const setupMiddleware = app => {
  const middlewareFiles = fs.readdirSync(middlewarePath);
  for (const filename of middlewareFiles) {
    const middlewareHandler = require(path.join(middlewarePath, filename));
    app.use(middlewareHandler);
  }
};

module.exports = setupMiddleware;
