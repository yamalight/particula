const helmet = require('helmet');
const express = require('express');
const bodyParser = require('body-parser');
const errorhandler = require('errorhandler');

exports.setupApp = () => {
  // init express app
  const app = express();

  // body parsing (POST/PUT support)
  app.use(bodyParser.urlencoded({extended: false}));
  app.use(bodyParser.json());

  // enable helmet with defaults
  app.use(helmet());

  return app;
};

exports.setupErrorHandling = app => {
  // Handle 404
  app.use((req, res, next) => {
    res.status(404).send(`Route ${req.url} Not found.`);
  });

  // only use in development
  if (process.env.NODE_ENV !== 'production') {
    app.use(errorhandler());
  } else {
    // Render error for production
    app.use((err, req, res, next) => {
      /* eslint handle-callback-err: off */
      res.status(500).send('500: Internal Server Error');
    });
  }
};
