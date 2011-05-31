var path = require('path'),
    dir = require('./dir'),
    obj = require('./obj'),
    resourceEnricherDir = path.join(__dirname, 'resourceEnrichers'),
    resourceEnrichers = dir.toObj(resourceEnricherDir);

var createResources = function(resourceDir) {
  var resources = {};
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
  });  
  return resources;
};


exports.createResources = createResources;
