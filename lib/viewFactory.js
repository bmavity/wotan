var jsdom = require('jsdom'),
    path = require('path'),
    viewFileName = 'view.html';

var canCreate = function(action) {
  var viewPath = path.join(action.path, viewFileName);
  return path.existsSync(viewPath);
};

var create = function(action) {
  var viewPath = path.join(action.path, viewFileName),
      view = {};
  view.path = viewPath;
  action.view = view;
};


exports.canCreate = canCreate;
exports.create = create;
