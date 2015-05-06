/*! fluxo v0.0.1 | (c) 2014, 2015 Samuel Simões |  */
(function(root, factory) {
  if (typeof define === "function" && define.amd) {
    define([], factory);
  } else if (typeof exports !== "undefined") {
    return module.exports = factory();
  } else {
    root.Fluxo = factory();
  }
})(this, function() {
  var Fluxo = {};

  Fluxo.extend = function(toExtend) {
    toExtend = toExtend || {};

    var extensions = Array.prototype.slice.call(arguments, 1);

    for (var i = 0, l = extensions.length; i < l; i ++) {
      var extension = extensions[i];

      for (var extensionProperty in extension) {
        toExtend[extensionProperty] = extension[extensionProperty];
      }
    }

    return toExtend;
  };

  var extend = function (props) {
    var that = this,
        child = function () { return that.apply(this, arguments); };

    Fluxo.extend(child, this);
    Fluxo.extend(this.prototype, props);
    Fluxo.extend(child.prototype, this.prototype);

    return child;
  };

  Fluxo.Radio = {
  callbackIds: 1,

  events: {},

  subscribe: function(eventName, callback) {
    var subscriptionId = (this.callbackIds + 1);

    this.events[eventName] = this.events[eventName] || {};
    this.events[eventName][subscriptionId] = callback;

    return this.removeSubscription.bind(this, eventName, subscriptionId);
  },

  removeSubscription: function(eventName, subscriptionId) {
    this.events[eventName] = this.events[eventName] || {};
    delete this.events[eventName][subscriptionId];
  },

  publish: function(eventName) {
    var callbacks = this.events[eventName] || {};

    for (var subscriptionId in callbacks) {
      callbacks[subscriptionId].apply(null, Array.prototype.slice.call(arguments, 1));
    }
  }
};


  Fluxo.Mixin = function(toMix) {
  var mixins = Array.prototype.slice.call(arguments, 1);

  var aggregateProperty = function(propName, property) {
    var existingProp = toMix[propName];

    toMix[propName] = function () {
      var args = Array.prototype.slice.call(arguments);

      property.apply(toMix, args);

      return existingProp.apply(toMix, args);
    };
  };

  var mix = function(mixin) {
    for (var propName in mixin) {
      var property = mixin[propName];

      if (toMix.hasOwnProperty(propName) && typeof(property) === "function") {
        aggregateProperty(propName, property);
      } else if (typeof(property) === "function") {
        toMix[propName] = property.bind(toMix);
      } else {
        toMix[propName] = property;
      }
    }
  };

  for (var i = 0, l = mixins.length; i < l; i ++) {
    var mixin = mixins[i];
    mix(mixin);
  }
};


  Fluxo.Store = function(data, options) {
  // Copy data to not mutate the original object
  if (data) {
    data = JSON.parse(JSON.stringify(data));
  }

  this.data = data || {};
  this.options = options || {};
  this.changeEventToken = Math.random().toString().slice(2, 11);

  Fluxo.Mixin.apply(null, [Object.getPrototypeOf(this)].concat(this.mixins));

  this.initialize(data, options);
};

Fluxo.Store.extend = extend;

Fluxo.Store.prototype = {
  initialize: function () {},

  mixins: [],

  toJSON: function() {
    return this.data;
  },

  setAttribute: function(attribute, value) {
    this.data[attribute] = value;

    this.emitChange();
  },

  set: function(data) {
    Fluxo.extend(this.data, data);

    this.emitChange();
  },

  onChange: function(callback) {
    return Fluxo.Radio.subscribe(this.changeEventToken, callback.bind(this));
  },

  emitChange: function() {
    Fluxo.Radio.publish(this.changeEventToken, this.toJSON());
  }
};


  Fluxo.CollectionStore = function(storesData, options) {
  // Copy data to not mutate the original object
  if (storesData) {
    storesData = JSON.parse(JSON.stringify(storesData));
  } else {
    storesData = [];
  }

  this.changeEventToken = Math.random().toString().slice(2, 11);
  this.stores = [];
  this.options = options || {};

  for (var i = 0, l = storesData.length; i < l; i ++) {
    this.addFromData(storesData[i]);
  }

  Fluxo.Mixin.apply(null, [Object.getPrototypeOf(this)].concat(this.mixins));

  this.initialize(storesData, options);
};

Fluxo.CollectionStore.extend = extend;

Fluxo.CollectionStore.prototype = {
  initialize: function () {},

  mixins: [],

  store: Fluxo.Store,

  storesOnChangeCancelers: {},

  addFromData: function(data) {
    var store = new this.store(data);

    this.addStore(store);
  },

  addStore: function(store) {
    if (this.storeAlreadyAdded(store)) { return; }

    this.stores.push(store);

    this.storesOnChangeCancelers[store.changeEventToken] = store.onChange(this.emitChange.bind(this));

    this.emitChange();
  },

  find: function (storeId) {
    var foundStore;

    if (!storeId) { return; }

    for (var i = 0, l = this.stores.length; i < l; i++) {
      var comparedStoreId = this.stores[i].data.id;

      if (comparedStoreId && comparedStoreId == storeId) {
        foundStore = this.stores[i];
        break;
      }
    }

    return foundStore;
  },

  storeAlreadyAdded: function (store) {
    return this.find(store.data.id);
  },

  onChange: function(callback) {
    return Fluxo.Radio.subscribe(this.changeEventToken, callback.bind(this));
  },

  remove: function(store) {
    this.storesOnChangeCancelers[store.changeEventToken]();

    delete this.storesOnChangeCancelers[store.changeEventToken];

    this.stores.splice(this.stores.indexOf(store), 1);

    this.emitChange();
  },

  emitChange: function() {
    Fluxo.Radio.publish(this.changeEventToken);
  },

  toJSON: function() {
    var collectionData = [];

    for (var i = 0, l = this.stores.length; i < l; i ++) {
      var store = this.stores[i];
      collectionData.push(store.toJSON());
    }

    return collectionData;
  }
};


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


  Fluxo.WatchComponent = {
  storesOnChangeCancelers: [],

  getInitialState: function() {
    var state = {};

    for (var i = 0, l = this.listenProps.length; i < l; i ++) {
      var storeIdentifierProp = this.listenProps[i],
          store = this.props[storeIdentifierProp];

      state[storeIdentifierProp] = store.toJSON();
    }

    return state;
  },

  componentWillMount: function() {
    for (var i = 0, l = this.listenProps.length; i < l; i ++) {
      var storeIdentifierProp = this.listenProps[i],
          store = this.props[storeIdentifierProp];

      this.listenStore(store);
    }
  },

  listenStore: function(store) {
    var canceler =
      store.onChange(function() {
        var state = {}

        state[storeIdentifierProp] = store.toJSON();

        this.setState(state);
      }.bind(this));

    this.storesOnChangeCancelers.push(canceler);
  },

  componentWillUnmount: function() {
    for (var i = 0, l = this.storesOnChangeCancelers.length; i < l; i ++) {
      this.storesOnChangeCancelers[i].apply();
    }
  }
};


  return Fluxo;
});
