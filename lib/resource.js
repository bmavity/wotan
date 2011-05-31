var path = require('path'),
    dir = require('./dir'),
    obj = require('./obj');

var createResources = function(resourceDir) {
  var resources = {};
  dir.forEachDirectory(resourceDir, function(resourceName) {
    var resource = {
          name: resourceName,
          path: path.join(resourceDir, resourceName)
        };
    require('./action').enrichResource(resource);
    resources[resourceName] = resource;
  });  
  return resources;
};


exports.createResources = createResources;
