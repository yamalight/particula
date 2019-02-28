/* eslint-env jest */
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
  expect(text).toMatchSnapshot();

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
