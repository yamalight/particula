#!/usr/bin/env node
const yargs = require('yargs');

const { start } = require('../index.js');

const package = require('../package.json');

// CLI config

yargs
  .version(package.version)
  .help()
  .command({
    command: '*',
    describe: 'start server',
    builder: {
      port: {
        alias: 'p',
        description: 'Start server at specified port',
        type: 'number'
      }
    },
    handler({ port }) {
      if (isNaN(port)) {
        console.error('Invalid port');
        process.exit(1);
      }
      start(port);
    }
  }).argv;

