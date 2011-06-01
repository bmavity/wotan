var fs = require('fs'),
    path = require('path'),
    stateFileName = 'state.js';

var canEnrichResource = function(resource) {
  var statePath = path.join(resource.path, stateFileName);
  return path.existsSync(statePath);
};

var enrichResource = function(resource) {
  var statePath = path.join(resource.path, stateFileName),
      state = require(statePath);
  resource.getActions = state.getActions;
};


exports.canEnrichResource = canEnrichResource;
exports.enrichResource = enrichResource;
