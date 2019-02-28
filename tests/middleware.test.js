/* eslint-env jest */
const path = require('path');
jest.spyOn(process, 'cwd').mockReturnValue(path.join(__dirname, 'fixtures'));

const express = require('express');
const request = require('supertest');
const setupMiddleware = require('../src/middleware');
const mockMiddleware = require('./fixtures/middlewares/mock');

test('Should load middlewares', async done => {
  const app = express();
  setupMiddleware(app);
  app.get('/', (req, res) => res.send('ok'));

  await request(app)
    .get('/')
    .expect(200, 'ok');

  expect(mockMiddleware).toBeCalled();

  done();
});
