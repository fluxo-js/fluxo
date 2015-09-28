/*! fluxo v0.0.16 | (c) 2014, 2015 Samuel Simões |  */
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


  Fluxo.ObjectStore = {
  setup: function () {
    this.cid = "FS:" + Fluxo.storesUUID++;

    this._fluxo = true;

    var previousData = this.data;

    this.data = {};

    this.set(previousData || {});

    this.registerComputed();

    this.initialize();
  },

  initialize: function () {},

  create: function() {
    var extensions = Array.prototype.slice.call(arguments);

    extensions.unshift({}, this);

    var extension = Fluxo.extend.apply(null, extensions);

    extension.setup.apply(extension);

    return extension;
  },

  on: function(events, callback) {
    var cancelers = [];

    for (var i = 0, l = events.length; i < l; i++) {
      var eventName = events[i],
          changeEventToken = (this.cid + ":" + eventName),
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

  triggerEvents: function(eventsNames) {
    var args = Array.prototype.slice.call(arguments, 1);

    for (var i = 0, l = eventsNames.length; i < l; i++) {
      var eventName = eventsNames[i];
      this.triggerEvent.apply(this, [eventName].concat(args));
    }
  },

  triggerEvent: function(eventName) {
    var changeChannel = (this.cid + ":" + eventName),
        args = Array.prototype.slice.call(arguments, 1);

    Fluxo.Radio.publish.apply(
      Fluxo.Radio,
      [changeChannel, this].concat(args)
    );

    Fluxo.Radio.publish.apply(
      Fluxo.Radio,
      [(this.cid + ":*"), eventName, this].concat(args)
    );
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

    this.triggerEvent(("change:" + attribute));

    if (options.silentGlobalChange) { return; }

    this.triggerEvent("change");
  },

  unsetAttribute: function (attribute, options) {
    options = options || {};

    delete this.data[attribute];

    this.triggerEvent(("change:" + attribute));

    if (options.silentGlobalChange) { return; }

    this.triggerEvent("change");
  },

  set: function(data) {
    for (var key in data) {
      this.setAttribute(key, data[key], { silentGlobalChange: true });
    }

    this.triggerEvent("change");
  },

  toJSON: function() {
    var data = JSON.parse(JSON.stringify(this.data));
    data.cid = this.cid;

    return data;
  }
};


  /** @namespace Fluxo */
/**
 * Fluxo.CollectionStore is a convenient wrapper to your literal objects arrays.
 */
Fluxo.CollectionStore = Fluxo.ObjectStore.create({
/** @lends Fluxo.CollectionStore */
  setup: function() {
    var previousStores = this.stores || [];

    this.stores = [];

    this.setStores(previousStores);

    this.createDelegateMethods();

    Fluxo.ObjectStore.setup.apply(this);
  },

  store: {},

  storesOnChangeCancelers: {},

  childrenDelegate: [],

  /**
   * @returns {null}
   */
  createDelegateMethods: function() {
    for (var i = 0, l = this.childrenDelegate.length; i < l; i++) {
      var methodName = this.childrenDelegate[i];
      this.createDelegateMethod(methodName);
    }
  },

  /**
   * @param {string} method to delegate to children
   * @returns {null}
   */
  createDelegateMethod: function(methodName) {
    this[methodName] = function(method, id) {
      var args = Array.prototype.slice.call(arguments, 2),
          child = this.find(id);

      child[method].apply(child, args);
    }.bind(this, methodName);
  },

  /**
   * @param {Object[]} stores data
   * @returns {null}
   */
  addStores: function(stores) {
    for (var i = 0, l = stores.length; i < l; i++) {
      var store = stores[i];
      this.addStore(store);
    }
  },

  /**
   * @param {Object[]} stores data
   * @returns {null}
   */
  reset: function(stores) {
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

    this.triggerEvents(["remove", "change"]);
  },

  /**
   * This methods add the missing objects and updates the existing stores.
   *
   * @param {Object[]} stores data
   * @returns undefined
   * @instance
   */
  setStores: function(data) {
    for (var i = 0, l = data.length; i < l; i++) {
      var storeData = data[i],
          alreadyAddedStore = this.find(storeData.id || storeData.cid);

      if (alreadyAddedStore) {
        alreadyAddedStore.set(storeData);
      } else {
        this.addStore(storeData);
      }
    }
  },

  /**
   * @param {Object} store data
   * @returns {Object}
   * @instance
   */
  addStore: function(store) {
    if (store._fluxo !== true) {
      store = Fluxo.ObjectStore.create(this.store, { data: store });
    }

    var alreadyAddedStore = this.find(store.data.id);

    if (alreadyAddedStore) { return alreadyAddedStore; }

    this.stores.push(store);

    var onStoreEvent = function(eventName) {
      var args = Array.prototype.slice.call(arguments, 1);

      args.unshift("stores:" + eventName);

      this.triggerEvent.apply(this, args);
    };

    this.storesOnChangeCancelers[store.cid] =
      store.on(["*"], onStoreEvent.bind(this));

    if (this.sort) {
      this.stores.sort(this.sort);
    }

    this.triggerEvents(["add", "change"]);

    return store;
  },

  /**
   * @param {number} storeID
   * @returns {Object|undefined} - the found flux store or undefined
   * @instance
   */
  find: function (storeID) {
    var foundStore;

    if (storeID) {
      foundStore = this.findWhere({ id: storeID });

      if (!foundStore) {
        this.stores.some(function(store) {
          if (store.cid === storeID) {
            foundStore = store;

            return true;
          }
        });
      }
    }

    return foundStore;
  },

  /**
   * @param {Object} criteria
   * @returns {Object|undefined} - the found flux store or undefined
   * @instance
   */
  findWhere: function(criteria) {
    return this.where(criteria, true)[0];
  },

  /**
   * @param {Object} criteria
   * @returns {Fluxo.ObjectStore[]} - the found flux stores or empty array
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
    this.storesOnChangeCancelers[store.cid].call();
    delete this.storesOnChangeCancelers[store.cid];
  },

  /**
   * @param {Fluxo.ObjectStore} store - the store to remove
   * @returns {null}
   * @instance
   */
  remove: function(store) {
    this.removeListenersOn(store);

    this.stores.splice(this.stores.indexOf(store), 1);

    this.triggerEvents(["remove", "change"]);
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
    var data = JSON.parse(JSON.stringify(this.data));
    data.cid = this.cid;

    return {
      data: data,
      stores: this.storesToJSON()
    };
  }
});


  return Fluxo;
});
