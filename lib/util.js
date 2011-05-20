var functionRegEx = /\(([\s\S]*?)\)/;

var forIn = function(obj, callback) {
  Object.keys(obj).forEach(callback);
};

var parseArguments = function(fn) {
  return functionRegEx.
    exec(fn)[1].
    replace(/\s/g, '').
    split(',').
    filter(function(name) {
      return name.length !== 0;
    });
};


exports.forIn = forIn;
exports.parseArguments = parseArguments;
