const fs = require('fs');
const path = require('path');

// converts file name to route name
exports.fileNameToRoute = fileName => {
  const fileBaseName = fileName.replace(/\.js$/, '');
  const routeName = fileBaseName.toLowerCase().replace('index', '');
  return routeName.startsWith('/') ? routeName : `/${routeName}`;
};

// recursively gets all valid files from folder
const getFiles = (folderpath, {base = '/'} = {}) =>
  [].concat.apply(
    [],
    fs.readdirSync(folderpath).map(filename => {
      const filepath = path.join(folderpath, filename);
      if (fs.lstatSync(filepath).isDirectory()) {
        return getFiles(filepath, {base: path.join(base, filename)});
      }

      return path.join(base, filename);
    })
  );
exports.getFiles = getFiles;

exports.detectRouteType = filePath => {
  const routeHandler = require(filePath);

  if (typeof routeHandler.default === 'function') {
    return 'esm';
  }

  if (typeof routeHandler === 'function') {
    return 'module';
  }

  if (routeHandler.useRouter && typeof routeHandler.useRouter === 'function') {
    return 'router';
  }

  const allowedMethods = ['put', 'get', 'post', 'delete'];
  const methods = Object.keys(routeHandler);
  if (!methods.some(method => allowedMethods.includes(method))) {
    throw new Error(`Route definition doesn't match possible formats`);
  }
  return 'methods';
};
