/* eslint-env jest */
const data = 'test-data';

const plugin = {
  name: 'testPlugin',
  data,
  setup: jest.fn(() => data),
  postsetup: jest.fn(),
};

module.exports = plugin;
