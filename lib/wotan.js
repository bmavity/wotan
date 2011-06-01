var fs = require('fs'),
    path = require('path'),
    transport = require('./transport'),
    dir = require('./dir'),
    util = require('./util'),
    obj = require('./obj'),
    resourceFactory = require('./resource'),
    resources = {};

var configure = function(opts) {
  resources = resourceFactory.createResources(opts.resourceDir);
  console.log(require('sys').inspect(resources, false, 5));
};

var executeCommand = function(command, params) {
  var resource = getResource(command).resource,
      result = resource.command.apply({}, params.arr),
      model = result && result.model || result || {};
  return {
    actions: resources['sessions'].getActions(params.obj.id),
    model: model
  };
};

var executeQuery = function(query, params) {
  var resource = getResource(query).resource,
      result = resource.query.apply({}, params.arr),
      model = result.model || result;
  return {
    actions: resources['sessions'].getActions(params.obj.id),
    model: model,
    viewTree: getView(query, params.arr)
  };
};

var getCommandParams = function(command) {
  var resource = getResource(command).resource;
  return resource.command.params;
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

var getAction = function(actionName, params) {
  var action = resources['sessions'][actionName],
      routeFactory = require('./factories/route');
  return routeFactory.populateRoute(action, params);
};

var getResource = function(path) {
  var resource = resources['sessions'],
      routeMatches = resource.filterActions(function(actionName, action) {
        return action.isMatchForPath(path);
      }),
      matchingAction;
  if(routeMatches.length) {
    matchingAction = routeMatches[0];
    return {
      resource: matchingAction,
      params: matchingAction.getRouteParams(path)
    };
  }
};

var getRouteParams = function(path) {
  var resource = resources['sessions'],
      routeMatches = resource.filterActions(function(actionName, action) {
        return action.isMatchForPath(path);
      });
  if(routeMatches.length) {
    return routeMatches[0].getRouteParams(path);
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



exports.getAction = getAction;
exports.getResource = getResource;
