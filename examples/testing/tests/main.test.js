/* eslint-env jest */
const request = require('supertest');
const {setup} = require('particula');

let app;
beforeAll(async () => {
  app = await setup();
});

test('Should test index route', async done => {
  const {text} = await request(app)
    .get('/')
    .expect(200);
  expect(text).toEqual('Hello Particula!');
  done();
});
