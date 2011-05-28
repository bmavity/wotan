var filter = function(obj, callback) {
  return Object.keys(obj).filter(function(key) {
    return callback(key, obj[key]);
  });
};


exports.filter = filter;
