var path = require('path'),
    dir = require('./dir'),
    obj = require('./obj'),
    resourceEnricherDir = path.join(__dirname, 'resourceEnrichers'),
    resourceEnrichers = dir.toObj(resourceEnricherDir),
    resources = {};

var createResources = function(resourceDir) {
  var r = {};
  dir.forEachDirectory(resourceDir, function(resourceName) {
    var resource = {
          name: resourceName,
          path: path.join(resourceDir, resourceName)
        };
    obj.forIn(resourceEnrichers, function(enricherName, enricher) {
      if(enricher.canEnrichResource) {
        enricher.enrichResource(resource);
      }
    });
    resources[resourceName] = resource;
    r[resourceName] = resource;
  });  
  return r;
};

var getResource = function(path) {
  return obj.first(resources, function(resourceName, resource) {
    return resource.isMatchForPath(path);
  });
};


exports.createResources = createResources;
exports.getResource = getResource;
