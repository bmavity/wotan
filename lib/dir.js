var fs = require('fs'),
    path = require('path');

var forEachDirectory = function(dirname, operation) {
  fs.readdirSync(dirname).filter(isDirectory(dirname)).forEach(operation);
};

var isDirectory = function(dirname) {
  return function(name) {
    return fs.statSync(path.join(dirname, name)).isDirectory();
  };
};

var toObj = function(dirname) {
  var obj = {};
  fs.readdirSync(dirname).forEach(function(fileName) {
    var name = path.basename(fileName, '.js');
    obj[name] = require(path.join(dirname, fileName));
  });
  return obj;
};


exports.forEachDirectory = forEachDirectory;
exports.toObj = toObj;
