var sys = require('sys'),
    fs = require('fs');

var scss = '.selector {\n' +
           '  prop: val\n' +
           '  prop2: val2' +
           '}';

var scssLines = scss.split('\n');

var scssBlock = (function() {
  var blocks = [],
      that = {};
  var currentBlock = {
    endsWith: function() { return false },
    parse: function(x) { sys.puts(x); }
  };

  that.parse = function(line) {
    if(currentBlock.endsWith(line)) {
      currentBlock.end(line);
      blocks.push(currentBlock);
      currentBlock = null;
    } else {
      currentBlock.parse(line);
    }
  };

  return that;
})();

var scopeBlock = (function() {
  var that = {};

  that.endsWith = function(line) {
    return line == '}';
  };

  that.parse = function(line) {
    sys.puts(line);
  };

  return that;
})();

scssBlock.parse(scssLines);

var scssParser = function() {
  scssLines.forEach(scssBlock.parse(line));
};
