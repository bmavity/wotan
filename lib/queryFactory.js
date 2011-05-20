var path = require('path'),
    util = require('./util'),
    queryFileName = 'model.js';

var createQuery = function(actionPath) {
  var queryPath = path.join(actionPath, queryFileName),
      query;
  if(path.existsSync(queryPath)) {
    query = require(queryPath);
    query.params = util.parseArguments(query);
    query.path = queryPath;
  }
  return query;
};


exports.createQuery = createQuery;
