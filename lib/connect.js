var transport = require('./transports/http');

var handler = function(handleResourceRequest) {
  return function(req, res, next) {
    var httpRequest = {
          req: req,
          res: res
        };
    if(transport.canHandleRequest(httpRequest)) {
      handleResourceRequest(httpRequest);
    } else {
      next();
    }
  };
};


exports.handler = handler;
