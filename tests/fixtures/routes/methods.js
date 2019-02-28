/* eslint-env jest */
exports.get = jest.fn((req, res) => res.send('get'));
exports.post = jest.fn((req, res) => res.send('post'));
exports.put = jest.fn((req, res) => res.send('put'));
exports.delete = jest.fn((req, res) => res.send('delete'));
