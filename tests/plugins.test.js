/* eslint-env jest */
const path = require('path');
jest.spyOn(process, 'cwd').mockReturnValue(path.join(__dirname, 'fixtures'));

const {setupPlugins, postsetupPlugins} = require('../src/config');
const testPlugin = require('./fixtures/testPlugin');

const mockApp = {set: jest.fn()};

test('Should run plugin setup', async done => {
  await setupPlugins(mockApp);
  expect(testPlugin.setup).toBeCalled();
  expect(mockApp.set).toBeCalledWith(testPlugin.name, testPlugin.data);
  done();
});

test('Should run plugin postsetup', async done => {
  await postsetupPlugins(mockApp);
  expect(testPlugin.postsetup).toBeCalled();
  done();
});
