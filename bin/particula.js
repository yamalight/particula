#!/usr/bin/env node
const arg = require('arg');
const pkg = require('../package.json');
const {start} = require('../index.js');

const args = arg({
  // Types
  '--help': Boolean,
  '--version': Boolean,
  '--port': Number, // --port <number> or --port=<number>
  // Aliases
  '-p': '--port', // -n <string>; result is stored in --name
});

// print out version
if (args['--version']) {
  console.log(`Particula version ${pkg.version}`);
  return;
}

// print out help
if (args['--help']) {
  console.log(`Particula - zero-config Express.js Framework 

Options:
  --version   Show version number                             [boolean]
  --help      Show this help                                  [boolean]
  --port, -p  Start server at specified port   [number] [default: 8080]`);
  return;
}

let port = 8080;
if (args['--port']) {
  port = parseInt(args['--port'], 10);
  console.log(port);
  if (isNaN(port)) {
    console.error('Invalid port');
    process.exit(1);
  }
}

start(port);
