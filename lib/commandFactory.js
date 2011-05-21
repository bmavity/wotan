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
    command = require(commandPath).handle || require(commandPath); //legacy
    command.params = util.parseArguments(command);
    command.path = commandPath;

    command.handle = command;
  }
  return command;
};


exports.canCreate = canCreate;
exports.create = create;
