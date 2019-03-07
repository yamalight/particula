/* eslint-env jest */
const core = {
  setup: jest.fn(),
  loadRoutes(routes) {
    this.routes = routes;
  },
  postSetup: jest.fn(),
};

module.exports = core;
