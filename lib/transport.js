var fs = require('fs'),
    path = require('path'),
    wotan = require('./wotan'),
    transportDir = path.join(__dirname, 'transports'),
    transportFiles = fs.readdirSync(transportDir),
    transports = {};
transportFiles.forEach(function(transportFile) {
  var transportPath = path.join(transportDir, transportFile),
      transportName = path.basename(transportPath, '.js');
  transports[transportName] = require(transportPath);
});

var handleResourceRequest = function(transportName, request, callback) {
  var transport = transports[transportName],
      resourceRequest = transport.createResourceRequest(request),
      params = resourceRequest.params,
      query = resourceRequest.query,
      command = resourceRequest.command,
      resource,
      executedHandler;
  if(query) {
    executedHandler = wotan.executeQuery(query, params.arr);
    callback && callback(resourceRequest, executedHandler);
  }
  if(command) {
    executedHandler = wotan.executeCommand(command, params.arr);
    callback && callback(resourceRequest, executedHandler);
  }
};

var init = function(transportName, server) {
  transports[transportName].init(exports, server);
};


exports.handleResourceRequest = handleResourceRequest; 
exports.init = init;
