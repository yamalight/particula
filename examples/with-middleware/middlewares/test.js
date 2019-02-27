// this will be injected as middleware with app.use()
module.exports = (req, res, next) => {
  console.log('test middleware has been triggered!');
  next();
};
