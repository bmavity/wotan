var jsdom = require('jsdom'),
    path = require('path'),
    viewFileName = 'view.html';


var getView = function(actionPath) {
  var viewPath = path.join(actionPath, viewFileName);
  return {
    path: viewPath
  };
};


exports.getView = getView;
