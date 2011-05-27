var path = require('path'),
    util = require('./util'),
    commandFileName = 'handler.js';

var canCreate = function(action) {
  var commandPath = path.join(action.path, commandFileName);
  return path.existsSync(commandPath);
};

var create = function(action) {
  var commandPath = path.join(action.path, commandFileName),
      command = require(commandPath).handle || require(commandPath); //legacy
  command.params = util.parseArguments(command);
  command.path = commandPath;
  command.handle = command;
  action.command = command;
};


exports.canCreate = canCreate;
exports.create = create;
