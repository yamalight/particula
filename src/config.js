const fs = require('fs');
const path = require('path');

// in-memory config cache
let config;

// project paths
const projectFolder = process.cwd();
const routesPath = path.join(projectFolder, 'routes');
const middlewarePath = path.join(projectFolder, 'middlewares');
const projectConfigPath = path.join(projectFolder, 'particula.config.js');
const projectPackagePath = path.join(projectFolder, 'package.json');

// config loading function
const loadConfig = () => {
  // if already loaded in mem - just return
  if (config) {
    return config;
  }

  // if doesn't exist - return default
  if (!fs.existsSync(projectConfigPath)) {
    // load params from package.json
    const appPackage = require(projectPackagePath);

    // get core
    const cores = Object.keys(appPackage.dependencies).filter(dep => dep.startsWith('particula-core-'));
    if (cores.length === 0) {
      console.error('Error! No cores installed!');
      process.exit(1);
    }
    if (cores.length > 2) {
      console.warn('Warning! You have more than one particula core in dependencies! Only the first one will be used!');
    }
    const core = cores[0];

    // get plugins
    const plugins = Object.keys(appPackage.dependencies).filter(dep => dep.startsWith('particula-plugin-'));

    // create new config
    config = {
      core,
      plugins,
    };
    return config;
  }

  config = require(projectConfigPath);
  if (!config.plugins) {
    config.plugins = [];
  }
  return config;
};

// loads the config and runs setup for all plugins
const setupPlugins = async core => {
  const config = loadConfig();
  await Promise.all(config.plugins.filter(p => p.setup).map(p => core.setupPlugin(p)));
};

// loads the config and runs postsetup for all plugins
const postsetupPlugins = async core => {
  const config = loadConfig();
  await Promise.all(config.plugins.filter(p => p.postsetup).map(p => core.postsetupPlugin(p)));
};

// core management
let core;
const getCore = () => {
  if (core) {
    return core;
  }
  const config = loadConfig();
  core = require(config.core);
  return core;
};

module.exports = {
  routesPath,
  middlewarePath,
  setupPlugins,
  postsetupPlugins,
  getCore,
};
