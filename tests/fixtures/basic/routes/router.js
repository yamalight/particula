/* eslint-env jest */
exports.useRouter = jest.fn(router => {
  router.get('/router', (req, res) => res.send('router'));
});
