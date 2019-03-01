/* eslint-env jest */
const fs = require('fs');
const path = require('path');
jest.spyOn(process, 'cwd').mockReturnValue(path.join(__dirname, 'fixtures'));

const express = require('express');
const request = require('supertest');
const setupRoutes = require('../src/routes');

// test routes
const indexRoute = require('./fixtures/routes/index');
const es6Route = require('./fixtures/routes/es6');
const methodsRoute = require('./fixtures/routes/methods');
const routerRoute = require('./fixtures/routes/router');
const nestedIndexRoute = require('./fixtures/routes/nested/index');
const nestedRoute = require('./fixtures/routes/nested/nest');

// load source for hot reload testing
const hotRoutePath = path.join(__dirname, 'fixtures', 'routes', 'hot.js');
const hotRouteSource = fs.readFileSync(path.join(__dirname, 'fixtures', 'hotreload', 'hot.js')).toString();

// sleep util
const sleep = time => new Promise(r => setTimeout(r, time));

// create app and setup routes
const app = express();
let watcher;
beforeAll(() => {
  watcher = setupRoutes(app);
});
afterAll(() => {
  watcher.close();
});

test('Should load basic route', async done => {
  await request(app)
    .get('/')
    .expect(200, 'ok');

  expect(indexRoute).toBeCalled();

  done();
});

test('Should load es6 route', async done => {
  await request(app)
    .get('/es6')
    .expect(200, 'ok');

  expect(es6Route.default).toBeCalled();

  done();
});

test('Should load router route', async done => {
  await request(app)
    .get('/router')
    .expect(200, 'router');

  expect(routerRoute.useRouter).toBeCalled();

  done();
});

test('Should load methods from route', async done => {
  await request(app)
    .get('/methods')
    .expect(200, 'get');
  expect(methodsRoute.get).toBeCalled();

  await request(app)
    .post('/methods')
    .expect(200, 'post');
  expect(methodsRoute.post).toBeCalled();

  await request(app)
    .put('/methods')
    .expect(200, 'put');
  expect(methodsRoute.put).toBeCalled();

  await request(app)
    .delete('/methods')
    .expect(200, 'delete');
  expect(methodsRoute.delete).toBeCalled();

  done();
});

test('Should load nested index route', async done => {
  await request(app)
    .get('/nested/')
    .expect(200, 'nested');

  expect(nestedIndexRoute).toBeCalled();

  done();
});

test('Should load nested route', async done => {
  await request(app)
    .get('/nested/nest')
    .expect(200, 'nest');

  expect(nestedRoute).toBeCalled();

  done();
});

test('Should manage routes with hot-reload', async done => {
  // write inial version
  fs.writeFileSync(hotRoutePath, hotRouteSource);

  // wait for route to update
  await sleep(500);

  // test that it works
  await request(app)
    .get('/hot')
    .expect(200, 'hot-add');

  const initialHotRoute = require(hotRoutePath);
  expect(initialHotRoute).toBeCalled();

  // reset jest module cache
  jest.resetModules();
  // write update source
  const newSource = hotRouteSource.replace('hot-add', 'hot-change');
  fs.writeFileSync(hotRoutePath, newSource);

  // wait for route to update
  await sleep(500);

  // test that it works
  await request(app)
    .get('/hot')
    .expect(200, 'hot-change');

  const updatedHotRoute = require(hotRoutePath);
  expect(updatedHotRoute).toBeCalled();

  // remove route
  fs.unlinkSync(hotRoutePath);

  // wait for route to update
  await sleep(500);

  // test that it works
  const {text} = await request(app)
    .get('/hot')
    .expect(404);

  expect(text).toContain('Cannot GET /hot');

  done();
});
