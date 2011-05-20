var fs = require('fs'),
    path = require('path'),
    util = require('./util'),
    commandFactory = require('./commandFactory'),
    queryFactory = require('./queryFactory'),
    viewFactory = require('./viewFactory'),
    resourceDir,
    resources = {},
    dummy = function(){};

var configure = function(opts) {
  resourceDir = opts.resourceDir
  findResources();
  findSomethings();
  Object.keys(resources).forEach(function(resource) {
    createRoutes(resource);
  });
  console.log(require('sys').inspect(resources, false, 5));
};

var createResource = function(resource, action, handlerFn) {
  var baseRoute = '/' + resource,
      params = util.parseArguments(handlerFn);
  baseRoute += action !== 'index' ? '/' + action : '';
  if(!resources[resource][action]) {
    resources[resource][action] = {
      route: baseRoute + (params.indexOf('id') !== -1 ? '/:id' : '')
    };
  }
  return resources[resource][action];
};

var findSomethings = function() {
  Object.keys(resources).forEach(function(resourceName) {
    var resource = resources[resourceName];
    forEachDirectory(resource.path, function(dirname) {
      var basePath = path.join(resource.path, dirname),
          query = queryFactory.createQuery(basePath),
          view = viewFactory.getView(basePath),
          command = commandFactory.createCommand(basePath);
      if(view) {
        if(query) {
          createResource(resourceName, dirname, query);
          resource[dirname].model = query;
          resource[dirname].modelParams = query.params;
        }
        if(!resource[dirname]) {
          createResource(resourceName, dirname, function(){});
        }
        resource[dirname].view = view;
      }
      if(command) {
        createResource(resourceName, dirname, command.handle);
        resource[dirname].command = command;
        resource[dirname].commandParams = command.params;
      }
    });
  });
};

var forEachDirectory = function(dirname, operation) {
  fs.readdirSync(dirname).filter(isDirectory(dirname)).forEach(operation);
};

var findResources = function() {
  forEachDirectory(resourceDir, function(dirname) {
    resources[dirname] = {
      path: getPath(dirname),
    };
  });
};

var getPath = function(name) {
  return path.join(resourceDir, name);
};

var isDirectory = function(dirname) {
  return function(name) {
    return fs.statSync(path.join(dirname, name)).isDirectory();
  };
};

function normalizePath(path, keys) {
  path = path
    .concat('/?')
    .replace(/\/\(/g, '(?:/')
    .replace(/(\/)?(\.)?:(\w+)(?:(\(.*?\)))?(\?)?/g, function(_, slash, format, key, capture, optional){
      keys.push(key);
      slash = slash || '';
      return ''
        + (optional ? '' : slash)
        + '(?:'
        + (optional ? slash : '')
        + (format || '') + (capture || '([^/]+?)') + ')'
        + (optional || '');
    })
    .replace(/([\/.])/g, '\\$1')
    .replace(/\*/g, '(.+)');
  return new RegExp('^' + path + '$', 'i');
};


var createRoutes = function(resourceName) {
  var resource = resources[resourceName],
      actions = Object.keys(resource).filter(function(action) {
        return !!resource[action].route;
      });
  actions.forEach(function(actionName) {
    var action = resource[actionName],
        routeParams = [];
    action.routeRegEx = normalizePath(action.route, routeParams);
    action.routeParams = routeParams;
  });
};


exports.getAction = function(action, params) {
  var route = resources['sessions'][action].route,
      keys = [];
  normalizePath(route, keys);
  keys.forEach(function(key) {
    var keyReplacer = new RegExp('\/:' + key, 'i');
    route = route.replace(keyReplacer, '/' + params[key]);
  });
  return {
    href: route
  };
};

exports.getResource = function(path) {
  if(resources['sessions'][path]) return resources['sessions'][path];
  var resource = resources['sessions'],
      routeMatches = Object.keys(resource).filter(function(actionName) {
        var action = resource[actionName];
        return action.routeRegEx && action.routeRegEx.exec(path) !== null;
      }),
      matchingResource,
      parsedRoute,
      index = 1,
      routeParams = {};
  if(routeMatches.length) {
    routeMatches.sort(function(a1, b1) {
      var a = resource[a1],
          b = resource[b1];
      if(a.routeParams.length < b.routeParams.length) return -1;
      if(a.routeParams.length > b.routeParams.length) return 1;
      return 0;
    });
    matchingResource = resource[routeMatches[0]];
    parsedRoute = matchingResource.routeRegEx.exec(path);
    matchingResource.routeParams.forEach(function(paramName) {
      routeParams[paramName] = parsedRoute[index];
      index += 1;
    });
    return {
      resource: matchingResource,
      params: routeParams
    };
  }
  return null;
};


exports.configure = configure;
