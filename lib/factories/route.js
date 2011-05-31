var util = require('../util');

var canCreate = function(action) {
  return !!(action.query || action.command || action.view);
};

var create = function(action) {
  var baseRoute = '/' + action.resourceName,
      handler = action.query || action.command,
      params = handler && util.parseArguments(handler) || [],
      routeParams = [];
  baseRoute += action.name !== 'index' ? '/' + action.name : '';
  action.route = baseRoute + (params.indexOf('id') !== -1 ? '/:id' : '');
  action.routeRegEx = normalizePath(action.route, routeParams);
  action.routeParams = routeParams;
};

var populateRoute = function(action, params) {
  var route = action.route,
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

var normalizePath = function(path, keys) {
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


exports.canCreate = canCreate;
exports.create = create;
exports.populateRoute = populateRoute;
