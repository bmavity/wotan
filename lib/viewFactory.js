var jsdom = require('jsdom'),
    path = require('path'),
    viewFileName = 'view.html';

var canCreate = function(actionPath) {
  var viewPath = path.join(actionPath, viewFileName);
  return path.existsSync(viewPath);
};

var create = function(actionPath) {
  var viewPath = path.join(actionPath, viewFileName),
      view;
  if(canCreate(actionPath)) {
    view = {};
    view.path = viewPath;
  }
  return view;
};


exports.canCreate = canCreate;
exports.create = create;
