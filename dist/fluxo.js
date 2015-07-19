/*! fluxo v0.0.13 | (c) 2014, 2015 Samuel Simões |  */
(function(root, factory) {
  if (typeof define === "function" && define.amd) {
    define([], factory);
  } else if (typeof exports !== "undefined") {
    return module.exports = factory();
  } else {
    root.Fluxo = factory();
  }
})(this, function() {
  var Fluxo = { storesUUID: 1 };

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


  Fluxo.Base = function() {
  var args = Array.prototype.slice.call(arguments);

  this.data = {};
  this.options = args[1] || {};
  this.changeEventToken = (Fluxo.storesUUID++);

  this._constructor.apply(this, args);
};

Fluxo.Base.extend = extend;

Fluxo.Base.prototype = {
  initialize: function () {},

  on: function(events, callback) {
    var cancelers = [];

    for (var i = 0, l = events.length; i < l; i++) {
      var eventName = events[i],
          changeEventToken = (this.changeEventToken + ":" + eventName),
          canceler = Fluxo.Radio.subscribe(changeEventToken, callback.bind(this));

      cancelers.push(canceler);
    }

    var aggregatedCanceler = function() {
      for (var i = 0, l = cancelers.length; i < l; i++) {
        var canceler = cancelers[i];
        canceler.call();
      }
    };

    return aggregatedCanceler;
  },

  trigger: function(eventsNames) {
    for (var i = 0, l = eventsNames.length; i < l; i++) {
      var eventName = eventsNames[i];
      this.triggerEvent(eventName);
    }
  },

  triggerEvent: function(eventName) {
    var changeChannel = (this.changeEventToken + ":" + eventName);

    Fluxo.Radio.publish(changeChannel);
    Fluxo.Radio.publish((this.changeEventToken + ":*"), eventName);
  },

  computed: {},

  attributeParsers: function() {},

  registerComputed: function() {
    var computeValue = function(attrName) {
      var value = this[attrName].call(this);
      this.setAttribute(attrName, value);
    };

    for (var attributeName in this.computed) {
      var toComputeEvents = this.computed[attributeName];

      this.on(toComputeEvents, computeValue.bind(this, attributeName));

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

    this.trigger(["change:" + attribute]);

    if (options.silentGlobalChange) { return; }

    this.trigger(["change"]);
  },

  set: function(data) {
    for (var key in data) {
      this.setAttribute(key, data[key], { silentGlobalChange: true });
    }

    this.trigger(["change"]);
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


  /** @namespace Fluxo */
/**
 * Fluxo.CollectionStore is a convenient wrapper to your literal objects arrays.
 *
 * @param {Object} storesData - Literal object with the initial payload
 * @param {Object} options - Literal object with any data. This data can
 * be accessed on the instance property with the same name.
 *
 * @class
 */
Fluxo.CollectionStore = Fluxo.Base.extend(
/** @lends Fluxo.CollectionStore */
{
 _constructor: function(storesData, options) {
    // Copy data to not mutate the original object
    if (storesData) {
      storesData = JSON.parse(JSON.stringify(storesData));
    } else {
      storesData = [];
    }

    this.stores = [];

    this.setFromData(storesData);

    this.registerComputed();

    this.initialize(storesData, options);
  },

  store: Fluxo.Store,

  storesOnChangeCancelers: {},

  /**
   * @param {Object[]} storesData
   * @returns {null}
   * @instance
   */
  resetFromData: function(storesData) {
    this.removeAll();
    this.setFromData(storesData);
  },

  /**
   * @param {Fluxo.Store[]} stores
   * @returns {null}
   * @instance
   */
  addStores: function(stores) {
    for (var i = 0, l = stores.length; i < l; i++) {
      var store = stores[i];
      this.addStore(store);
    }
  },

  /**
   * @param {Fluxo.Store[]} stores
   * @returns {null}
   * @instance
   */
  resetFromStores: function(stores) {
    this.removeAll();
    this.addStores(stores);
  },

  /**
   * @returns {null}
   * @instance
   */
  removeAll: function() {
    for (var i = (this.stores.length - 1), l = 0; i >= l; i--) {
      var store = this.stores[i];
      this.removeListenersOn(store);
    }

    this.stores = [];

    this.trigger(["remove", "change"]);
  },

  /**
   * @param {Object} data
   * @returns {Object}
   * @instance
   */
  addFromData: function(data) {
    var store = new this.store(data);

    return this.addStore(store);
  },

  /**
   * This methods add the missing objects and updates the existing stores.
   *
   * @param {Object[]} data
   * @returns undefined
   * @instance
   */
  setFromData: function(data) {
    for (var i = 0, l = data.length; i < l; i++) {
      var storeData = data[i],
          alreadyAddedStore = this.find(storeData.id);

      if (alreadyAddedStore) {
        alreadyAddedStore.set(storeData);
      } else {
        this.addFromData(storeData);
      }
    }
  },

  /**
   * @param {Fluxo.Store} store
   * @returns {Fluxo.Store}
   * @instance
   */
  addStore: function(store) {
    var alreadyAddedStore = this.find(store.data.id);

    if (alreadyAddedStore) { return alreadyAddedStore; }

    this.stores.push(store);

    var onStoreEvent = function(eventName) {
      this.trigger([("stores:" + eventName)]);
    };

    this.storesOnChangeCancelers[store.changeEventToken] =
      store.on(["*"], onStoreEvent.bind(this));

    if (this.sort) {
      this.stores.sort(this.sort);
    }

    this.trigger(["add", "change"]);

    return store;
  },

  /**
   * @param {number} storeID
   * @returns {Fluxo.Store|undefined} - the found flux store or undefined
   * @instance
   */
  find: function (storeID) {
    var foundStore;

    if (storeID) {
      foundStore = this.findWhere({ id: storeID });
    }

    return foundStore;
  },

  /**
   * @param {object} criteria
   * @returns {Fluxo.Store|undefined} - the found flux store or undefined
   * @instance
   */
  findWhere: function(criteria) {
    return this.where(criteria, true)[0];
  },

  /**
   * @param {object} criteria
   * @returns {Fluxo.Store[]} - the found flux stores or empty array
   * @instance
   */
  where: function(criteria, stopOnFirstMatch) {
    var foundStores = [];

    if (!criteria) { return []; }

    for (var i = 0, l = this.stores.length; i < l; i++) {
      var comparedStore = this.stores[i],
          matchAllCriteria = true;

      for (var key in criteria) {
        if (comparedStore.data[key] !== criteria[key]) {
          matchAllCriteria = false;
          break;
        }
      }

      if (matchAllCriteria) {
        foundStores.push(comparedStore);

        if (stopOnFirstMatch) {
          break;
        }
      }
    }

    return foundStores;
  },

  /**
   * @returns {null}
   * @instance
   */
  removeListenersOn: function(store) {
    this.storesOnChangeCancelers[store.changeEventToken].call();
    delete this.storesOnChangeCancelers[store.changeEventToken];
  },

  /**
   * @param {Fluxo.Store} store - the store to remove
   * @returns {null}
   * @instance
   */
  remove: function(store) {
    this.removeListenersOn(store);

    this.stores.splice(this.stores.indexOf(store), 1);

    this.trigger(["remove", "change"]);
  },

  /**
   * It returns an array with the result of toJSON method invoked
   * on each stores.
   *
   * @returns {Object}
   *
   * @instance
   */
  storesToJSON: function() {
    var collectionData = [];

    for (var i = 0, l = this.stores.length; i < l; i++) {
      var store = this.stores[i];
      collectionData.push(store.toJSON());
    }

    return collectionData;
  },

  /**
   * It returns a JSON with two keys. The first, "data", is the
   * store attributes setted using the setAttribute method and the second key,
   * stores, is the result of storesToJSON method.
   *
   * e.g {
   *   data: { count: 20 },
   *   stores: [{ name: "Samuel }]
   * }
   *
   * @returns {Object}
   *
   * @instance
   */
  toJSON: function() {
    return {
      data: this.data,
      stores: this.storesToJSON()
    };
  }
});


  return Fluxo;
});
