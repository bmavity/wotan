var functionRegEx = /\(([\s\S]*?)\)/;

var parseArguments = function(fn) {
  return functionRegEx.
    exec(fn)[1].
    replace(/\s/g, '').
    split(',').
    filter(function(name) {
      return name.length !== 0;
    });
};


exports.parseArguments = parseArguments;
