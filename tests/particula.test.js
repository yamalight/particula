/* eslint-env jest */
const path = require('path');
const baseDir = path.join(__dirname, 'fixtures', 'noconfig');
jest.spyOn(process, 'cwd').mockReturnValue(baseDir);

// mock core and plugin
jest.mock('particula-core-test', () => require('./__mocks__/core'), {virtual: true});
jest.mock('particula-plugin-test', () => require('./__mocks__/plugin'), {virtual: true});

const {setup} = require('../src');
const core = require('particula-core-test');
const plugin = require('particula-plugin-test');

beforeAll(async () => {
  await setup();
});

test('Should setup correct routes', async done => {
  const files = core.routes.map(file => ({
    ...file,
    filePath: file.filePath.replace(baseDir, ''),
  }));
  expect(files).toMatchSnapshot();
  done();
});

test('Should run setup test core functions', async done => {
  expect(core.setup).toBeCalled();
  expect(core.postSetup).toBeCalled();
  done();
});
