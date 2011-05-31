var path = require('path'),
    dir = require('./dir'),
    obj = require('./obj'),
    factoryDir = path.join(__dirname, 'factories'),
    factories = dir.toObj(factoryDir);

var canEnrichResource = function(resource) {
  return true;
};

var enrichResource = function(resource) {
  var resourceName = resource.name,
      resourcePath = resource.path;
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
    resource[actionName] = action;
  });
};


exports.canEnrichResource = canEnrichResource;
exports.enrichResource = enrichResource;
