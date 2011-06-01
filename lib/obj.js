var filter = function(obj, callback) {
  return Object.keys(obj).filter(function(key) {
    return callback(key, obj[key]);
  });
};

var first = function(obj, callback) {
  var keys = Object.keys(obj),
      len = keys.length,
      i,
      key,
      val;
  for(i = 0; i < len; i += 1) {
    key = keys[i];
    val = obj[key];
    if(callback(key, val)) {
      return val;
    }
  }
};

var forIn = function(obj, callback) {
  Object.keys(obj).forEach(function(key) {
    callback(key, obj[key])
  });
};


exports.filter = filter;
exports.first = first;
exports.forIn = forIn;
