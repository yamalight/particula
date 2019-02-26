#!/usr/bin/env node
const yargs = require('yargs');

const start = require('../index.js');

const package = require('../package.json');

yargs
    .version(package.version)
    .help()
    .demand(1)
    .command(start)
    .argv