var fs = require('fs'),
    path = require('path'),
    transport = require('./transport'),
    util = require('./util'),
    factories = {},
    resourceDir,
    resources = {},
    dummy = function(){};

factories['command'] = require('./commandFactory');
factories['query'] = require('./queryFactory');
factories['view'] = require('./viewFactory');

var configure = function(opts) {
  resourceDir = opts.resourceDir
  findResources();
  findSomethings();
  util.forIn(resources, function(resource) {
    createRoutes(resource);
  });
  console.log(require('sys').inspect(resources, false, 5));
};

var getCreateActionFn = function(resourceName) {
  var resource = resources[resourceName];
  return function(actionName) {
    var actionPath = path.join(resource.path, actionName), /*
        action = createResource(resourceName, actionName);

    util.forIn(factories, function(factoryName) {
      var factory = factories[factoryName],
          action = resource
      if(factory.canCreate(actionPath)) {
        resource[actionName][factory.create(actionPath);
      }
    });
*/
        query = factories['query'].create(actionPath),
        view = factories['view'].create(actionPath),
        command = factories['command'].create(actionPath);
    if(view) {
      if(query) {
        createResource(resourceName, actionName, query);
        resource[actionName].model = query;
      }
      if(!resource[actionName]) {
        createResource(resourceName, actionName, function(){});
      }
      resource[actionName].view = view;
    }
    if(command) {
      createResource(resourceName, actionName, command);
      resource[actionName].command = command;
    }
  };
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

var executeCommand = function(command, params) {
  var resource = getResource(command).resource;
  return resource.command.apply({}, params);
};

var executeQuery = function(query, params) {
  var resource = getResource(query).resource;
  return resource.model.apply({}, params);
};

var findSomethings = function() {
  util.forIn(resources, function(resourceName) {
    var resource = resources[resourceName],
        createAction = getCreateActionFn(resourceName);
    forEachDirectory(resource.path, createAction);
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

var getCommandParams = function(command) {
  var resource = getResource(command).resource;
  return resource.command.params;
};

var getPath = function(name) {
  return path.join(resourceDir, name);
};

var getQueryParams = function(query) {
  var resource = getResource(query).resource;
  return resource.model.params;
};

var hasCommand = function(route) {
  var result = getResource(route),
      resource = result && result.resource;
  if(!result) return false;
  if(!resource) return false;
  return !!resource.command;
};

var hasQuery = function(route) {
  var result = getResource(route),
      resource = result && result.resource;
  if(!result) return false;
  if(!resource) return false;
  return resource.model || resource.view;
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

var getResource = function(path) {
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
exports.executeCommand = executeCommand;
exports.executeQuery = executeQuery;
exports.getCommandParams = getCommandParams;
exports.getQueryParams = getQueryParams;
exports.hasCommand = hasCommand;
exports.hasQuery = hasQuery;
exports.initializeTransport = transport.init;



exports.getResource = getResource;
