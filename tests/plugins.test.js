/* eslint-env jest */
const path = require('path');
jest.spyOn(process, 'cwd').mockReturnValue(path.join(__dirname, 'fixtures', 'basic'));

const {setupPlugins, postsetupPlugins} = require('../src/config');
const testPlugin = require('./fixtures/basic/testPlugin');

const testCore = {
  setupPlugin: jest.fn(p => p.setup()),
  postsetupPlugin: jest.fn(p => p.postsetup()),
};

test('Should run plugin setup', async done => {
  await setupPlugins(testCore);
  expect(testPlugin.setup).toBeCalled();
  expect(testCore.setupPlugin).toBeCalledWith(testPlugin);
  done();
});

test('Should run plugin postsetup', async done => {
  await postsetupPlugins(testCore);
  expect(testPlugin.postsetup).toBeCalled();
  expect(testCore.postsetupPlugin).toBeCalledWith(testPlugin);
  done();
});
