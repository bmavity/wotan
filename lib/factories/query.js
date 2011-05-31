var path = require('path'),
    util = require('../util'),
    queryFileName = 'model.js';

var canCreate = function(action) {
  var queryPath = path.join(action.path, queryFileName);
  return path.existsSync(queryPath);
};

var create = function(action) {
  var queryPath = path.join(action.path, queryFileName),
      query = require(queryPath);
  query.params = util.parseArguments(query);
  query.path = queryPath;
  action.query = query;
};


exports.canCreate = canCreate;
exports.create = create;
