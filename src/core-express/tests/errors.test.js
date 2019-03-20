/* eslint-env jest */
const path = require('path');
jest.spyOn(process, 'cwd').mockReturnValue(path.join(__dirname, 'fixtures'));

const request = require('supertest');
const {setup} = require('../../index');

test('Should handle 404', async done => {
  const app = await setup();

  await request(app)
    .get('/404')
    .expect(404, 'Route /404 Not found.');

  done();
});

test('Should handle 500 errors in development', async done => {
  const app = await setup();

  const {text} = await request(app)
    .get('/throw')
    .expect(500);

  // replace local paths
  const currentPath = path.resolve(__dirname).replace('/tests', '');
  const pathRegex = new RegExp(currentPath, 'g');

  // replace all things
  const cleanText = text.replace(pathRegex, '');

  expect(cleanText).toContain('module.exports (/tests/fixtures/routes/throw.js:2:9)');

  done();
});
