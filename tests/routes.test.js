/* eslint-env jest */
const fs = require('fs');
const path = require('path');
const baseDir = path.join(__dirname, 'fixtures', 'basic');
jest.spyOn(process, 'cwd').mockReturnValue(baseDir);

const setupRoutes = require('../src/routes');

// load source for hot reload testing
const hotRoutePath = path.join(__dirname, 'fixtures', 'basic', 'routes', 'hot.js');
const hotRouteNestedPath = path.join(__dirname, 'fixtures', 'basic', 'routes', 'nested', 'hot.js');
const hotRouteSource = fs.readFileSync(path.join(__dirname, 'fixtures', 'basic', 'hotreload', 'hot.js')).toString();

// sleep util
const sleep = time => new Promise(r => setTimeout(r, time));

// create test core
const testCore = {
  loadRoutes(files) {
    this.files = files;
  },
  hotReload: {
    add: jest.fn(),
    change: jest.fn(),
    delete: jest.fn(),
  },
};

// setup routes
let watcher;
beforeAll(
  () =>
    new Promise(async r => {
      watcher = await setupRoutes(testCore);
      watcher.on('ready', r);
    })
);
afterAll(() => {
  watcher.close();
});

test('Should routes map', async done => {
  const files = testCore.files.map(file => ({
    ...file,
    filePath: file.filePath.replace(baseDir, ''),
  }));
  expect(files).toMatchSnapshot();
  done();
});

test('Should manage routes with hot-reload', async done => {
  // write initial version
  fs.writeFileSync(hotRoutePath, hotRouteSource);

  // wait for route to update
  await sleep(500);

  // test that route add was called
  expect(testCore.hotReload.add).toBeCalledWith({
    routeName: '/hot',
    routeHandler: require(hotRoutePath),
    filePath: hotRoutePath,
    routeType: 'module',
  });

  // reset jest module cache
  jest.resetModules();
  // write update source
  const newSource = hotRouteSource.replace('hot-add', 'hot-change');
  fs.writeFileSync(hotRoutePath, newSource);

  // wait for route to update
  await sleep(500);

  // test that route change was called
  expect(testCore.hotReload.change).toBeCalledWith({
    routeName: '/hot',
    routeHandler: require(hotRoutePath),
    filePath: hotRoutePath,
    routeType: 'module',
  });

  // remove route
  fs.unlinkSync(hotRoutePath);

  // wait for route to update
  await sleep(500);

  // test that route delete was called
  expect(testCore.hotReload.delete).toBeCalledWith('/hot');

  done();
});

test('Should manage nested routes with hot-reload', async done => {
  // write inial version
  fs.writeFileSync(hotRouteNestedPath, hotRouteSource);

  // wait for route to update
  await sleep(500);

  // test that route add was called
  expect(testCore.hotReload.add).toBeCalledWith({
    routeName: '/nested/hot',
    routeHandler: require(hotRouteNestedPath),
    filePath: hotRouteNestedPath,
    routeType: 'module',
  });

  // reset jest module cache
  jest.resetModules();
  // write update source
  const newSource = hotRouteSource.replace('hot-add', 'hot-change');
  fs.writeFileSync(hotRouteNestedPath, newSource);

  // wait for route to update
  await sleep(500);

  // test that route change was called
  expect(testCore.hotReload.change).toBeCalledWith({
    routeName: '/nested/hot',
    routeHandler: require(hotRouteNestedPath),
    filePath: hotRouteNestedPath,
    routeType: 'module',
  });

  // remove route
  fs.unlinkSync(hotRouteNestedPath);

  // wait for route to update
  await sleep(500);

  // test that route delete was called
  expect(testCore.hotReload.delete).toBeCalledWith('/nested/hot');

  done();
});
