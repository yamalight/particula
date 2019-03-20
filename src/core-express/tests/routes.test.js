/* eslint-env jest */
const path = require('path');
jest.spyOn(process, 'cwd').mockReturnValue(path.join(__dirname, 'fixtures'));

const request = require('supertest');
const {setup} = require('../../index');

// test routes
const indexRoute = require('./fixtures/routes/index');
const es6Route = require('./fixtures/routes/es6');
const methodsRoute = require('./fixtures/routes/methods');
const routerRoute = require('./fixtures/routes/router');
const nestedIndexRoute = require('./fixtures/routes/nested/index');
const nestedRoute = require('./fixtures/routes/nested/nest');

// create app and setup routes
let app;
beforeAll(async () => {
  app = await setup();
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
