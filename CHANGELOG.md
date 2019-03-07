# 0.8.0 / 2019-03-07

- Make all setup methods async for more flexibility
- Add loading plugins from package.json when no config is present
- Allow overriding core via config

# 0.7.0 / 2019-03-05

- Rewrite particula to use swappable particula-cores
- Add support for nested routes
- Allow disabling hot-reload for tests
- Add tests

# 0.6.0 / 2019-02-26

- Add basic middleware example
- Add example app with babel hook
- Add nextjs app example
- Add HTTP methods example
- Add basic example app

# 0.5.1 / 2019-02-26

- Handle errors after plugins postinit to allow method override

# 0.5.0 / 2019-02-26

- Add async wrapper to allow async routes by default

# 0.4.1 / 2019-02-26

- Remove excessive logging in bin

# 0.4.0 / 2019-02-26

- Load routes directly into server instance when running in production
- Replace yargs with arg

# 0.3.0 / 2019-02-26

- Add basic hot-reloading for routes Closes #3
- Add basic error handling and traces when not in production Closes #6
- Add default port to cli
- Add lint script and fix formatting in bin
- Add prettierrc
- Add eslintrc

# 0.1.0 / 2019-02-26

- Initial version
