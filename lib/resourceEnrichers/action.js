var path = require('path'),
    dir = require('../dir'),
    obj = require('../obj'),
    factoryDir = path.join(__dirname, '..', 'factories'),
    factories = dir.toObj(factoryDir);

var canEnrichResource = function(resource) {
  return true;
};

var enrichResource = function(resource) {
  var resourceName = resource.name,
      resourcePath = resource.path,
      actions = {};
  dir.forEachDirectory(resource.path, function(actionFile) {
    var actionPath = path.join(resource.path, actionFile),
        actionName = path.basename(actionFile, '.js'),
        action = {
          name: actionName,
          path: actionPath,
          resourceName: resourceName
        };
    obj.forIn(factories, function(factoryName, factory) {
      if(factory.canCreate(action)) {
        factory.create(action);
      }
    });
    actions[actionName] = action;
    resource[actionName] = action;
  });

  resource.filterActions = filterActions.bind({}, actions);
};

var filterActions = function(actions, filterFn) {
  return obj.filter(actions, filterFn);
};


exports.canEnrichResource = canEnrichResource;
exports.enrichResource = enrichResource;
