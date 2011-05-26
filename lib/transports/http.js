var wotan = require('../wotan'),
    paramHandlerFactories = [];

var canHandleRequest = function(httpRequest) {
  var req = httpRequest.req,
      route = req.url,
      method = req.method.toLowerCase();
  if(method === 'get' && wotan.hasQuery(route)) return true;
  return method === 'post' && wotan.hasCommand(route);
};

var createResourceRequest = function(httpRequest) {
  var req = httpRequest.req,
      route = req.url,
      method = req.method.toLowerCase();
  if(method === 'get') {
    return {
      query: route,
      params: resolveParams(req, wotan.getQueryParams(route))
    };
  }
  if(method === 'post') {
    return {
      command: req.url,
      params: resolveParams(req, wotan.getCommandParams(route))
    };
  }
};

var init = function(transport, opts) {
  var server = opts.server,
      ve = opts.viewEngine;
  server.use(function(req, res, next) {
    var httpRequest = {
          req: req,
          res: res
        };
    if(canHandleRequest(httpRequest)) {
      transport.handleResourceRequest('http', httpRequest, function(resourceRequest, executedHandler) {
        if(resourceRequest.query) {
          ve.renderView(req, res, wotan.getResource(resourceRequest.query).resource, ve.executeHandlerFn(resourceRequest, executedHandler));
        }
        if(resourceRequest.command) {
          ve.renderJson(req, res, ve.executeHandlerFn(resourceRequest, executedHandler));
        }
      });
    } else {
      next();
    }
  });
};

var resolveParams = function(req, paramNames) {
  var params = {
    arr: [],
    obj: {}
  };
  paramNames.forEach(function(paramName) {
    paramHandlerFactories.forEach(function(paramHandlerFactory) {
      paramHandlerFactory.create(req).addValue(paramName, params);
    });
  });
  return params;
};


exports.createResourceRequest = createResourceRequest;
exports.init = init;



paramHandlerFactories.push((function() {
  var that = {};

  var create = function(req) {
    return {
      addValue: createAddValueFn(req)
    };
  };

  var createAddValueFn = function(req) {
    return function(paramName, params) {
      var val = req.body && req.body[paramName];
      if(val) {
        params.arr.push(val);
        params.obj[paramName] = val;
      }
    };
  };
    
  that.create = create;
  return that;
})());

paramHandlerFactories.push((function() {
  var wotan = require('../wotan'),
      that = {};

  var createAddValueFn = function(req) {
    return function(paramName, params) {
      var result = wotan.getResource(req.url),
          routeParams = result.params,
          val = routeParams[paramName];
      if(val) {
        params.arr.push(val);
        params.obj[paramName] = val;
      }
    };
  };
    
  var create = function(req) {
    return {
      addValue: createAddValueFn(req)
    };
  };

  that.create = create;
  return that;
})());

paramHandlerFactories.push((function() {
  var userAgent = require('useragent'),
      that = {};

  var create = function(req) {
    return {
      addValue: createAddValueFn(req)
    };
  };

  var createAddValueFn = function(req) {
    return function(paramName, params) {
      var val;
      if(paramName === 'agent') {
        val = userAgent.parser(req.headers['user-agent']);
        params.arr.push(val);
        params.obj[paramName] = val;
      }
    };
  };
    
  that.create = create;
  return that;
})());
