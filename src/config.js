const fs = require('fs');
const path = require('path');

// in-memory config cache
let config;

// default project config
const defaultProjectConfig = {plugins: []};

// project paths
const projectFolder = process.cwd();
const routesPath = path.join(projectFolder, 'routes');
const middlewarePath = path.join(projectFolder, 'middlewares');
const projectConfigPath = path.join(projectFolder, 'particula.config.js');

// config loading function
const loadConfig = () => {
  // if already loaded in mem - just return
  if (config) {
    return config;
  }

  // if doesn't exist - return default
  if (!fs.existsSync(projectConfigPath)) {
    config = defaultProjectConfig;
    return defaultProjectConfig;
  }

  config = require(projectConfigPath);
  if (!config.plugins) {
    config.plugins = [];
  }
  return config;
};

// loads the config and runs setup for all plugins
const setupPlugins = async app => {
  const config = loadConfig();
  await Promise.all(
    config.plugins
      .filter(p => p.setup)
      .map(async plugin => {
        const pluginData = await plugin.setup(app);
        app.set(plugin.name, pluginData);
      })
  );
};

// loads the config and runs postsetup for all plugins
const postsetupPlugins = async app => {
  const config = loadConfig();
  await Promise.all(config.plugins.filter(p => p.postsetup).map(plugin => plugin.postsetup(app)));
};

module.exports = {
  routesPath,
  middlewarePath,
  setupPlugins,
  postsetupPlugins,
};
