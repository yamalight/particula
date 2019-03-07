const fs = require('fs');
const path = require('path');
const {middlewarePath} = require('./config');

// sets up all user middleware files
const setupMiddleware = async core => {
  // if middleware path doesn't exist - just return
  if (!fs.existsSync(middlewarePath)) {
    return;
  }
  // get list of files
  const middlewareFiles = fs.readdirSync(middlewarePath);
  for (const filename of middlewareFiles) {
    const middlewareHandler = require(path.join(middlewarePath, filename));
    await core.setupMiddleware(middlewareHandler);
  }
};

module.exports = setupMiddleware;
