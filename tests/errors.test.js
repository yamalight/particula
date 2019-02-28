/* eslint-env jest */
const path = require('path');
const express = require('express');
const request = require('supertest');
const {setupErrorHandling} = require('../src/express');

test('Should handle 404', async done => {
  const app = express();
  await setupErrorHandling(app);

  await request(app)
    .get('/404')
    .expect(404, 'Route /404 Not found.');

  done();
});

test('Should handle 500 errors in development', async done => {
  const app = express();
  app.get('/', () => {
    throw new Error('test error');
  });
  await setupErrorHandling(app);

  const {text} = await request(app)
    .get('/')
    .expect(500);

  // replace local paths
  const currentPath = path.resolve(__dirname).replace('/tests', '');
  const pathRegex = new RegExp(currentPath, 'g');

  // replace possible mismatching stack traces
  const stack1 = /at Server.emit \(events.js:.+?\)/g;
  const stack2 = /at parserOnIncoming \(_http_server.js:.+?\)/g;
  const stack3 = /at HTTPParser.parserOnHeadersComplete \(_http_common.js:.+?\)/g;

  // replace all things
  const cleanText = text
    .replace(pathRegex, '')
    .replace(stack1, '')
    .replace(stack2, '')
    .replace(stack3, '');

  expect(cleanText).toMatchSnapshot();

  done();
});

test('Should handle 500 errors in production', async done => {
  process.env.NODE_ENV = 'production';
  const app = express();
  app.get('/', () => {
    throw new Error('test error');
  });
  await setupErrorHandling(app);

  await request(app)
    .get('/')
    .expect(500, '500: Internal Server Error');

  done();
});
