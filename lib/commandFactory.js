var path = require('path'),
    util = require('./util'),
    commandFileName = 'handler.js';

var hasCommand = function(actionPath) {
  var commandPath = path.join(actionPath, commandFileName);
  return path.existsSync(commandPath);
};

var createCommand = function(actionPath) {
  var commandPath = path.join(actionPath, commandFileName),
      command;
  if(hasCommand(actionPath)) {
    command = require(commandPath);
    command.params = util.parseArguments(command.handle);
    command.path = commandPath;
  }
  return command;
};


exports.createCommand = createCommand;
