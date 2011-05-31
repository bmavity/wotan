var fs = require('fs'),
    path = require('path');

var toObj = function(dirname) {
  var obj = {};
  fs.readdirSync(dirname).forEach(function(fileName) {
    var name = path.basename(fileName, '.js');
    obj[name] = require(path.join(dirname, fileName));
  });
  return obj;
};


exports.toObj = toObj;
