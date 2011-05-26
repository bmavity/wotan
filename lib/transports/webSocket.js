var wotan = require('../wotan'),
    paramHandlerFactories = [];

var canHandleRequest = function(webSocketRequest) {
  var message = webSocketRequest.message,
      query = message && message.query,
      command = message && message.command;
  if(!message) return false;
  if(query && wotan.hasQuery(query)) return true;
  return command && wotan.hasCommand(command);
};

var createResourceRequest = function(webSocketRequest) {
  var message = webSocketRequest.message,
      query = message.query,
      command = message.command;
  if(query) {
    return {
      query: query,
      params: resolveParams(webSocketRequest, wotan.getQueryParams(query))
    };
  }
  if(command) {
    return {
      command: command,
      params: resolveParams(webSocketRequest, wotan.getCommandParams(command))
    };
  }
};

var init = function(transport, socketIoServer) {
  socketIoServer.on('connection', function(client) {
    var channelId = client.sessionId;

    client.on('message', function(message) {
      var webSocketRequest = {
            clientId: channelId,
            message: message
          };
      if(canHandleRequest(webSocketRequest)) {
        transport.handleResourceRequest('webSocket', webSocketRequest);
      }
    });
  });  
};

var resolveParams = function(webSocketRequest, paramNames) {
  var params = {
    arr: [],
    obj: {}
  };
  paramNames.forEach(function(paramName) {
    paramHandlerFactories.forEach(function(paramHandlerFactory) {
      paramHandlerFactory.create(webSocketRequest).addValue(paramName, params);
    });
  });
  return params;
};


exports.createResourceRequest = createResourceRequest;
exports.init = init;




paramHandlerFactories.push((function() {
  var that = {};

  var create = function(webSocketRequest) {
    return {
      addValue: createAddValueFn(webSocketRequest)
    };
  };

  var createAddValueFn = function(webSocketRequest) {
    return function(paramName, params) {
      var requestData = webSocketRequest.message.data,
          val;
      if(requestData) {
        val = requestData[paramName];
        if(val) {
          params.arr.push(val);
          params.obj[paramName] = val;
        }
      }
    };
  };
    
  that.create = create;
  return that;
})());

paramHandlerFactories.push((function() {
  var wotan = require('../wotan'),
      that = {};

  var createAddValueFn = function(webSocketRequest) {
    var message = webSocketRequest.message,
        url = message.query || message.command;
    return function(paramName, params) {
      var result = wotan.getResource(url),
          routeParams = result.params,
          val = routeParams[paramName];
      if(val) {
        params.arr.push(val);
        params.obj[paramName] = val;
      }
    };
  };
    
  var create = function(webSocketRequest) {
    return {
      addValue: createAddValueFn(webSocketRequest)
    };
  };

  that.create = create;
  return that;
})());

paramHandlerFactories.push((function() {
  var that = {};

  var create = function(webSocketRequest) {
    return {
      addValue: createAddValueFn(webSocketRequest)
    };
  };

  var createAddValueFn = function(webSocketRequest) {
    return function(paramName, params) {
      var val;
      if(paramName === 'clientId') {
        val = webSocketRequest['clientId'];
        params.arr.push(val);
        params.obj[paramName] = val;
      }
    };
  };
    
  that.create = create;
  return that;
})());
