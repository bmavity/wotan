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
  getReferencedActions(viewPath, function(childActions) {
    view.childActions = childActions;
  });
  action.view = view;
};

var getReferencedActions = function(viewPath, callback) {
  jsdom.env(viewPath, function(errors, window) {
    var doc = window.document,
        links = Array.prototype.slice.call(doc.getElementsByTagName('link'), 0),
        actions = links.filter(function(link) {
          return link.getAttribute('rel') === 'action';
        }).map(function(action) {
          return action.getAttribute('href');
        });
        
    callback(actions);
  });
};


exports.canCreate = canCreate;
exports.create = create;
