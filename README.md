# Particula

> Zero-config Express.js Framework

[![CircleCI](https://circleci.com/gh/particulajs/particula.svg?style=svg)](https://circleci.com/gh/particulajs/particula)
[![npm](https://img.shields.io/npm/v/particula.svg)](https://www.npmjs.com/package/particula)
[![license](https://img.shields.io/github/license/mashape/apistatus.svg?maxAge=2592000)](https://opensource.org/licenses/MIT)

Particula is a zero-config Express.js-based web framework.

## ⚠️Warning!⚠️

Particula is still pre-v1.0, API might be unstable and things might break along the way!

## Project goals

The project has two simple goals:

1. Use sensible defaults and best practices for Express.js out of the box
2. Allow devs to focus on business logic, not framework setup

## Features

- POST/PUT/DELETE methods enabled by default
- Helmet enabled by default
- Async routes support out-of-the-box
- Routes hot-reload (in development mode)
- Full error stack traces on request (in development mode)

## How to use

### Setup

Install it:

```bash
npm install --save particula
```

and add a script to your package.json:

```json
{
  "scripts": {
    "start": "particula"
  }
}
```

Now, your file-system is the main API. Every `.js` file becomes an Express route that gets automatically handled.

Populate `./routes/index.js` inside your project:

```js
const home = (req, res) => res.send('Welcome to particula.js!');

module.exports = home;
```

and then just execute `npm start` and go to `http://localhost:8080`.

### POST, PUT, DELETE Routes

You might want to define routes that handle other types of requests than just GET.  
To do that, simply export functions named after the method you want to use.  
Here's a basic example of all possible handlers:

```js
// routes/methods.js - /methods route will accept GET, POST, PUT, DELETE
// get handler
exports.get = (req, res) => res.send('i am normal get handler');
// post handler
exports.post = (req, res) => res.send({method: 'post', body: req.body});
// put handler
exports.put = (req, res) => res.send({method: 'put', body: req.body});
// delete handler
exports.delete = (req, res) => res.send('i am delete handler');
```

### Custom Routes

Particula also provides a way to define custom routes.  
This can be done by exporting named function `useRouter`.  
Here's a basic example of handler with router:

```js
// routes/subroutes.js - will use router so no prefix will be assigned
exports.useRouter = router => {
  router.get('/myCustomRoute', (req, res) => res.send({accepted: true, body: req.body}));
};
```

### Middlewares

Particla provides a way to register global middlewares when needed.  
To do so, simply create `middlewares` folder and add any `.js` files that export middleware handler inside.  
Here's an example of basic middleware:

```js
// middlewares/log.js - will be added as middleware to express instance
module.exports = (req, res, next) => {
  console.log('middleware triggered by:', req.originalUrl);
  next();
};
```

### Plugins

In some cases you might want to have more complex scripts that interact with Express.js instance.
This can be done via plugins.  
Plugins must be registered using `particula.config.js` in the root of your application, like so:

```js
// particula.config.js
const myPlugin = require('./myplugin');

module.exports = {
  plugins: [myPlugin],
};
```

Plugins have access to two function - `setup` and `postsetup`.  
First - `setup` - function is executed before Particula does user middleware and routes setup.  
While second - `postsetup` - function is executed after everything has been configured.  
All data returned by `setup` function is stored using `expressApp.set` function and `name` variable exported by plugin.

Here's an example of simple plugin that adds passport-based authentication:

```js
// auth.plugin.js
// defines the name of the plugin,
// the name will be used to store and access data returned from setup function
exports.name = 'auth-plugin';

exports.setup = app => {
  app.use(session());
  app.use(passport.initialize());
  app.use(passport.session());

  // passport setup
  // ...

  // renders login page
  app.get('/login', (req, res) => {});
  // handles auth with passport
  app.post('/login', passport.authenticate('local'));

  // function that checks if user is authenticated
  const isAuthed = (req, res) => {};

  return {isAuthed};
};
```

This plugin will exposed `isAuthed` function that can be accessed from anywhere in the following way:

```js
// routes/protected.js
exports.useRouter = router => {
  const {isAuthed} = app.get('auth-plugin');
  router.get('/protected/me', isAuthed, (req, res) => res.send({accepted: true, body: req.body}));
};
```

## License

Licensed under MIT.
