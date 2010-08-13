var vows = require('vows'),
    assert = require('assert'),
    srcDir = __dirname + '/../src/';

var indentParser = require(srcDir + 'indent_parser'),
    indentedLine = '  This line has an indent',
    unindentedLine = 'This line does not have an indent';

vows.describe('indent parser').addBatch({
  'when matching an indented line': {
    topic: function() {
      return indentParser.matches(indentedLine);
    },
    'should match': function(topic) {
      assert.isTrue(topic);
    }
  },
  'when matching an unindented line': {
    topic: function() {
      return indentParser.matches(unindentedLine);
    },
    'should not match': function(matched) {
      assert.isFalse(matched);
    }
  }
}).run();
