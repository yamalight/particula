/* eslint-env jest */
const path = require('path');
jest.spyOn(process, 'cwd').mockReturnValue(path.join(__dirname, 'fixtures'));

const request = require('supertest');
const {setup} = require('../../index');
const mockMiddleware = require('./fixtures/middlewares/mock');

test('Should load middlewares', async done => {
  const app = await setup();

  await request(app)
    .get('/')
    .expect(200, 'ok');

  expect(mockMiddleware).toBeCalled();

  done();
});
