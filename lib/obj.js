var filter = function(obj, callback) {
  return Object.keys(obj).filter(function(key) {
    return callback(key, obj[key]);
  });
};

var forIn = function(obj, callback) {
  Object.keys(obj).forEach(function(key) {
    callback(key, obj[key])
  });
};


exports.filter = filter;
exports.forIn = forIn;
