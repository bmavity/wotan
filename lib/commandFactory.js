var path = require('path'),
    util = require('./util'),
    commandFileName = 'handler.js';

var canCreate = function(actionPath) {
  var commandPath = path.join(actionPath, commandFileName);
  return path.existsSync(commandPath);
};

var create = function(actionPath) {
  var commandPath = path.join(actionPath, commandFileName),
      command;
  if(canCreate(actionPath)) {
    command = require(commandPath);
    command.params = util.parseArguments(command.handle);
    command.path = commandPath;
  }
  return command;
};


exports.canCreate = canCreate;
exports.create = create;
