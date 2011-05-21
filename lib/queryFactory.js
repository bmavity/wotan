var path = require('path'),
    util = require('./util'),
    queryFileName = 'model.js';

var canCreate = function(actionPath) {
  var queryPath = path.join(actionPath, queryFileName);
  return path.existsSync(queryPath);
};

var create = function(actionPath) {
  var queryPath = path.join(actionPath, queryFileName),
      query;
  if(canCreate(actionPath)) {
    query = require(queryPath);
    query.params = util.parseArguments(query);
    query.path = queryPath;
  }
  return query;
};


exports.canCreate = canCreate;
exports.create = create;
