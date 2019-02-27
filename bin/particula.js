#!/usr/bin/env node
const yargs = require('yargs');
const pkg = require('../package.json');
const {start} = require('../index.js');

/* eslint no-unused-expressions: off */
yargs
  .version(pkg.version)
  .help()
  .command({
    command: '*',
    describe: 'start server',
    builder: {
      port: {
        alias: 'p',
        description: 'Start server at specified port',
        type: 'number',
      },
    },
    handler({port}) {
      if (isNaN(port)) {
        console.error('Invalid port');
        process.exit(1);
      }
      start(port);
    },
  }).argv;
