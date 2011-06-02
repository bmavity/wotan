var canEnrichResource = function() {
  return true;
};

var enrichResource = function(resource) {
  var pathRegEx = new RegExp('^\/' + resource.name + '\/');
  
  resource.isMatchForPath = isMatchForPath.bind({}, pathRegEx);
};

var isMatchForPath = function(matcher, path) {
  return matcher.exec(path) !== null;
};


exports.canEnrichResource = canEnrichResource;
exports.enrichResource = enrichResource;
