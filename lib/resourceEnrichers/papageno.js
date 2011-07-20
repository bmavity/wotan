var fs = require('fs'),
    path = require('path'),
    notifyFileName = 'notify.js';

var canEnrichResource = function(resource) {
  var notifyPath = path.join(resource.path, notifyFileName);
  return path.existsSync(notifyPath);
};

var enrichResource = function(resource) {
  var notifyPath = path.join(resource.path, notifyFileName),
      notify = require(notifyPath);
  notify.singles.forEach(function(evt) {
    console.log(evt);
  });
};


exports.canEnrichResource = canEnrichResource;
exports.enrichResource = enrichResource;
