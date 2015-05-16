/*! fluxo v0.0.5 | (c) 2014, 2015 Samuel Simões |  */
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

  var extend = function (protoProps, staticProps) {
    var parent = this,
        child;

    child = function(){ return parent.apply(this, arguments); };

    // Add static properties to the constructor function, if supplied.
    Fluxo.extend(child, parent, staticProps);

    var Surrogate = function() { this.constructor = child; };
    Surrogate.prototype = parent.prototype;
    child.prototype = new Surrogate;

    if (protoProps) {
      Fluxo.extend(child.prototype, protoProps);
    }

    child.__super__ = parent.prototype;

    return child;
  };

  Fluxo.Radio = {
  callbackIds: 1,

  events: {},

  subscribe: function(eventName, callback) {
    var subscriptionId = this.callbackIds++;

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


  Fluxo.Base = function() {
  var args = Array.prototype.slice.call(arguments);

  this.data = {};
  this.options = args[1] || {};
  this.changeEventToken = Math.random().toString().slice(2, 11);

  Fluxo.Mixin.apply(null, [Object.getPrototypeOf(this)].concat(this.mixins));

  this._constructor.apply(this, args);
};

Fluxo.Base.extend = extend;

Fluxo.Base.prototype = {
  initialize: function () {},

  mixins: [],

  on: function(events, callback) {
    var cancelers = [];

    for (var i = 0, l = events.length; i < l; i ++) {
      var eventName = events[i],
          changeEventToken = (this.changeEventToken + ":" + eventName),
          canceler = Fluxo.Radio.subscribe(changeEventToken, callback.bind(this));

      cancelers.push(canceler);
    }

    var aggregatedCanceler = function() {
      for (var i = 0, l = cancelers.length; i < l; i ++) {
        var canceler = cancelers[i];
        canceler.call();
      }
    };

    return aggregatedCanceler;
  },

  trigger: function(eventName) {
    Fluxo.Radio.publish(this.changeEventToken + ":" + eventName);
  },

  computed: {},

  attributeParsers: function() {},

  registerComputed: function() {
    for (var attributeName in this.computed) {
      var toComputeEvents = this.computed[attributeName];

      this.on(toComputeEvents, function(attrName) {
        var value = this[attrName].call(this);
        this.setAttribute(attrName, value);
      }.bind(this, attributeName));

      this.setAttribute(attributeName, this[attributeName].call(this));
    }
  },

  setAttribute: function(attribute, value, options) {
    options = options || {};

    if (this.data[attribute] === value) { return; }

    if (this.attributeParsers[attribute]) {
      value = this.attributeParsers[attribute](value);
    }

    this.data[attribute] = value;

    this.trigger("change:" + attribute);

    if (options.silentGlobalChange) { return; }

    this.trigger("change");
  },

  set: function(data) {
    for (var key in data) {
      this.setAttribute(key, data[key], { silentGlobalChange: true });
    }

    this.trigger("change");
  }
};


  Fluxo.Store = Fluxo.Base.extend({
  _constructor: function(data, options) {
    // Copy data to not mutate the original object
    if (data) {
      data = JSON.parse(JSON.stringify(data));
    }

    this.set(data || {});

    this.registerComputed();

    this.initialize(data, options);
  },

  toJSON: function() {
    return this.data;
  }
});


  Fluxo.CollectionStore = Fluxo.Base.extend({
 _constructor: function(storesData, options) {
    // Copy data to not mutate the original object
    if (storesData) {
      storesData = JSON.parse(JSON.stringify(storesData));
    } else {
      storesData = [];
    }

    this.stores = [];

    this.addBunchFromData(storesData);

    this.registerComputed();

    this.initialize(storesData, options);
  },

  store: Fluxo.Store,

  storesOnChangeCancelers: {},

  /**
   * @param {Object[]} - storesData
   * @returns {null}
   */
  addBunchFromData: function(storesData) {
    for (var i = 0, l = storesData.length; i < l; i ++) {
      var storeData = storesData[i];
      this.addFromData(storeData);
    }
  },

  /**
   * @param {Fluxo.Store[]} - stores
   * @returns {null}
   */
  addBunchStores: function(stores) {
    for (var i = 0, l = stores.length; i < l; i ++) {
      var store = stores[i];
      this.addStore(store);
    }
  },

  /**
   * @returns {null}
   */
  removeAll: function() {
    for (var i = (this.stores.length - 1), l = 0; i >= l; i--) {
      var store = this.stores[i];
      this.removeListenersOn(store);
    }

    this.stores = [];

    this.trigger("remove");
    this.trigger("change");
  },

  /**
   * @param {Object} data
   * @returns {Fluxo.Store}
   */
  addFromData: function(data) {
    var store = new this.store(data);

    return this.addStore(store);
  },

  /**
   * @param {Fluxo.Store} store
   * @returns {Fluxo.Store}
   */
  addStore: function(store) {
    if (this.storeAlreadyAdded(store)) { return; }

    this.stores.push(store);

    this.storesOnChangeCancelers[store.changeEventToken] =
      store.on(["change"], this.trigger.bind(this, "change"));

    this.trigger("add", store);
    this.trigger("change");

    return store;
  },

  /**
   * @param {number} storeId
   * @returns {Fluxo.Store|undefined} - the found flux store or undefined
   */
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

  /**
   * Verifies presence of a store on the collection
   *
   * @param {Fluxo.Store} store - the store to verify presence
   * @returns {Fluxo.Store|undefined} - the found flux store or undefined
   */
  storeAlreadyAdded: function (store) {
    return this.find(store.data.id);
  },

  /**
   * @returns {null}
   */
  removeListenersOn: function(store) {
    this.storesOnChangeCancelers[store.changeEventToken].call();
    delete this.storesOnChangeCancelers[store.changeEventToken];
  },

  /**
   * @param {Fluxo.Store} store - the store to remove
   * @returns {null}
   */
  remove: function(store) {
    this.removeListenersOn(store);

    this.stores.splice(this.stores.indexOf(store), 1);

    this.trigger("remove", store);
    this.trigger("change");
  },

  /**
   * @returns {Object}
   */
  storesToJSON: function() {
    var collectionData = [];

    for (var i = 0, l = this.stores.length; i < l; i ++) {
      var store = this.stores[i];
      collectionData.push(store.toJSON());
    }

    return collectionData;
  },

  /**
   * @returns {Object}
   */
  toJSON: function() {
    return {
      data: this.data,
      stores: this.storesToJSON()
    };
  }
});


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

      this.listenStore(store, storeIdentifierProp);
    }
  },

  listenStore: function(store, storeIdentifierProp) {
    var canceler =
      store.on(["change"], function() {
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
