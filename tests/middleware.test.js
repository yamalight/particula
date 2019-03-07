/* eslint-env jest */
const path = require('path');
jest.spyOn(process, 'cwd').mockReturnValue(path.join(__dirname, 'fixtures', 'basic'));

const setupMiddleware = require('../src/middleware');
const mockMiddleware = require('./fixtures/basic/middlewares/mock');

const testCore = {
  setupMiddleware: jest.fn(),
};

test('Should load middlewares', async done => {
  setupMiddleware(testCore);
  expect(testCore.setupMiddleware).toBeCalledWith(mockMiddleware);
  done();
});
