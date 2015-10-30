/*! fluxo-js v0.0.17 | (c) 2014, 2015 Samuel Simões |  */
(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.Fluxo = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var ObjectStore = require("./fluxo.object_store.js");

/** @namespace Fluxo */
/**
 * Fluxo.CollectionStore is a convenient wrapper to your literal objects arrays.
 */
module.exports = ObjectStore.create({
/** @lends Fluxo.CollectionStore */
  setup: function() {
    var previousStores = this.stores || [];

    this.stores = [];

    this.setStores(previousStores);

    this.createDelegateMethods();

    ObjectStore.setup.apply(this);
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
  resetStores: function(stores) {
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
      store = ObjectStore.create(this.store, { data: store });
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

},{"./fluxo.object_store.js":4}],2:[function(require,module,exports){
module.exports = function(toExtend) {
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

},{}],3:[function(require,module,exports){
var ObjectStore = require("./fluxo.object_store.js"),
    CollectionStore = require("./fluxo.collection_store.js"),
    Extend = require("./fluxo.extend.js"),
    Radio = require("./fluxo.radio.js");

module.exports = {
  ObjectStore: ObjectStore,
  CollectionStore: CollectionStore,
  Extend: Extend,
  Radio: Radio
};

},{"./fluxo.collection_store.js":1,"./fluxo.extend.js":2,"./fluxo.object_store.js":4,"./fluxo.radio.js":5}],4:[function(require,module,exports){
var Radio = require("./fluxo.radio.js"),
    extend = require("./fluxo.extend.js");

var storesUUID = 1;

module.exports = {
  setup: function () {
    this.cid = "FS:" + storesUUID++;

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

    var extension = extend.apply(null, extensions);

    extension.setup.apply(extension);

    return extension;
  },

  on: function(events, callback) {
    var cancelers = [];

    for (var i = 0, l = events.length; i < l; i++) {
      var eventName = events[i],
          changeEventToken = (this.cid + ":" + eventName),
          canceler = Radio.subscribe(changeEventToken, callback.bind(this));

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

    Radio.publish.apply(
      Radio,
      [changeChannel, this].concat(args)
    );

    Radio.publish.apply(
      Radio,
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

  reset: function (data) {
    data = data || {};

    for (var key in this.data) {
      if (data[key] === undefined) {
        this.unsetAttribute(key, { silentGlobalChange: true });
      }
    }

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

},{"./fluxo.extend.js":2,"./fluxo.radio.js":5}],5:[function(require,module,exports){
module.exports = {
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

},{}]},{},[3])(3)
});