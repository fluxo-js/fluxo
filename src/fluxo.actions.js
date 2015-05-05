Fluxo.actionHandlers = {};

Fluxo.registerActionHandler = function(identifier, handler) {
  Fluxo.actionHandlers[identifier] = handler;

  var args = Array.prototype.slice.call(arguments, 2);

  if (typeof handler.initialize == "function") {
    handler.initialize.apply(handler, args);
  }
};

Fluxo.callAction = function(actionHandlerIdentifier, actionName) {
  var handler = Fluxo.actionHandlers[actionHandlerIdentifier];

  if (!handler) {
    throw new Error("Action handler " + actionHandlerIdentifier + " not found.");
  }

  var action = handler[actionName];

  if (!action) {
    throw new Error("Action " + actionName + " not found on " + actionHandlerIdentifier + " handler.");
  }

  var args = Array.prototype.slice.call(arguments, 2);

  return action.apply(handler, args);
};
