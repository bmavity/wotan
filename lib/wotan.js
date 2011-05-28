var fs = require('fs'),
    path = require('path'),
    transport = require('./transport'),
    util = require('./util'),
    obj = require('./obj'),
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
    var actionPath = path.join(resource.path, actionName),
        action = resource[actionName] = resource[actionName] || { name: actionName, path: actionPath };
    util.forIn(factories, function(factoryName, factory) {
      if(factory.canCreate(action)) {
        factory.create(action);
      }
    });
    addRoute(resourceName, action);
  };
};

var addRoute = function(resourceName, action) {
  var baseRoute = '/' + resourceName,
      handlerFn = action.query || action.command,
      params = handlerFn && util.parseArguments(handlerFn) || [];
  baseRoute += action.name !== 'index' ? '/' + action.name : '';
  action.route = baseRoute + (params.indexOf('id') !== -1 ? '/:id' : '');
};

var executeCommand = function(command, params) {
  var resource = getResource(command).resource,
      result = resource.command.apply({}, params.arr),
      model = result.model || result;
  return {
    actions: require(path.join(resourceDir, 'sessions', 'state')).getActions(params.obj.id),
    model: model
  };
};

var executeQuery = function(query, params) {
  var resource = getResource(query).resource,
      result = resource.query.apply({}, params.arr),
      model = result.model || result;
  return {
    actions: require(path.join(resourceDir, 'sessions', 'state')).getActions(params.obj.id),
    model: model,
    viewTree: getView(query, params.arr)
  };
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
  return resource.query.params;
};

var getView = function(query, params) {
  var result = getResource(query),
      resource = result && result.resource,
      view = resource && resource.view,
      viewTree = {},
      childViews = {};
  if(result && resource && view) {
    viewTree.view = view;
    viewTree.childViews = childViews;
    viewTree.data = resource.query && resource.query.apply({}, params) || {};
    viewTree.data = viewTree.data.model || viewTree.data;
    view.childActions.forEach(function(childAction) {
      var action = resources['sessions'][childAction],
          actionView = {
            view: action.view
          };
      actionView.data = action.query && action.query.apply({}, params) || {};
      actionView.data = actionView.data.model || actionView.data;
      childViews[childAction] = actionView;
    });
    return viewTree;
  }
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
  return resource.query || resource.view;
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

var getRouteParams = function(path) {
  if(resources['sessions'][path]) return resources['sessions'][path];
  var resource = resources['sessions'],
      routeMatches = obj.filter(resource, function(actionName, action) {
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
    return routeParams;
  }
};

exports.configure = configure;
exports.executeCommand = executeCommand;
exports.executeQuery = executeQuery;
exports.getCommandParams = getCommandParams;
exports.getQueryParams = getQueryParams;
exports.getRouteParams = getRouteParams;
exports.getView = getView;
exports.hasCommand = hasCommand;
exports.hasQuery = hasQuery;
exports.initializeTransport = transport.init;



exports.getResource = getResource;
