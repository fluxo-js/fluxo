/*! fluxo-js v0.0.17 | (c) 2014, 2015 Samuel Simões |  */
(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.Fluxo = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var _fluxoObject_storeJs = require("./fluxo.object_store.js");

var _fluxoObject_storeJs2 = _interopRequireDefault(_fluxoObject_storeJs);

/** @namespace Fluxo */
/**
 * Fluxo.CollectionStore is a convenient wrapper to your literal objects arrays.
 */
exports["default"] = _fluxoObject_storeJs2["default"].create({
  /** @lends Fluxo.CollectionStore */
  setup: function setup() {
    var previousStores = this.stores || [];

    this.stores = [];

    this.setStores(previousStores);

    this.createDelegateMethods();

    _fluxoObject_storeJs2["default"].setup.apply(this);
  },

  store: {},

  storesOnChangeCancelers: {},

  childrenDelegate: [],

  /**
   * @returns {null}
   */
  createDelegateMethods: function createDelegateMethods() {
    for (var i = 0, l = this.childrenDelegate.length; i < l; i++) {
      var methodName = this.childrenDelegate[i];
      this.createDelegateMethod(methodName);
    }
  },

  /**
   * @param {string} method to delegate to children
   * @returns {null}
   */
  createDelegateMethod: function createDelegateMethod(methodName) {
    this[methodName] = (function (method, id) {
      var child = this.find(id);

      for (var _len = arguments.length, args = Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
        args[_key - 2] = arguments[_key];
      }

      child[method].apply(child, args);
    }).bind(this, methodName);
  },

  /**
   * @param {Object[]} stores data
   * @returns {null}
   */
  addStores: function addStores(stores) {
    for (var i = 0, l = stores.length; i < l; i++) {
      var store = stores[i];
      this.addStore(store);
    }
  },

  /**
   * @param {Object[]} stores data
   * @returns {null}
   */
  resetStores: function resetStores(stores) {
    this.removeAll();
    this.addStores(stores);
  },

  /**
   * @returns {null}
   * @instance
   */
  removeAll: function removeAll() {
    for (var i = this.stores.length - 1, l = 0; i >= l; i--) {
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
  setStores: function setStores(data) {
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
  addStore: function addStore(store) {
    if (store._fluxo !== true) {
      store = _fluxoObject_storeJs2["default"].create(this.store, { data: store });
    }

    var alreadyAddedStore = this.find(store.data.id);

    if (alreadyAddedStore) {
      return alreadyAddedStore;
    }

    this.stores.push(store);

    var onStoreEvent = function onStoreEvent(eventName) {
      for (var _len2 = arguments.length, args = Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
        args[_key2 - 1] = arguments[_key2];
      }

      args.unshift("stores:" + eventName);
      this.triggerEvent.apply(this, args);
    };

    this.storesOnChangeCancelers[store.cid] = store.on(["*"], onStoreEvent.bind(this));

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
  find: function find(storeID) {
    var foundStore;

    if (storeID) {
      foundStore = this.findWhere({ id: storeID });

      if (!foundStore) {
        this.stores.some(function (store) {
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
  findWhere: function findWhere(criteria) {
    return this.where(criteria, true)[0];
  },

  /**
   * @param {Object} criteria
   * @returns {Fluxo.ObjectStore[]} - the found flux stores or empty array
   * @instance
   */
  where: function where(criteria, stopOnFirstMatch) {
    var foundStores = [];

    if (!criteria) {
      return [];
    }

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
  removeListenersOn: function removeListenersOn(store) {
    this.storesOnChangeCancelers[store.cid].call();
    delete this.storesOnChangeCancelers[store.cid];
  },

  /**
   * @param {Fluxo.ObjectStore} store - the store to remove
   * @returns {null}
   * @instance
   */
  remove: function remove(store) {
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
  storesToJSON: function storesToJSON() {
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
  toJSON: function toJSON() {
    var data = JSON.parse(JSON.stringify(this.data));
    data.cid = this.cid;

    return {
      data: data,
      stores: this.storesToJSON()
    };
  }
});
module.exports = exports["default"];

},{"./fluxo.object_store.js":4}],2:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports["default"] = function () {
  var toExtend = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

  for (var _len = arguments.length, extensions = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
    extensions[_key - 1] = arguments[_key];
  }

  for (var i = 0, l = extensions.length; i < l; i++) {
    var extension = extensions[i];

    for (var extensionProperty in extension) {
      toExtend[extensionProperty] = extension[extensionProperty];
    }
  }

  return toExtend;
};

;
module.exports = exports["default"];

},{}],3:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var _fluxoObject_storeJs = require("./fluxo.object_store.js");

var _fluxoObject_storeJs2 = _interopRequireDefault(_fluxoObject_storeJs);

var _fluxoCollection_storeJs = require("./fluxo.collection_store.js");

var _fluxoCollection_storeJs2 = _interopRequireDefault(_fluxoCollection_storeJs);

var _fluxoExtendJs = require("./fluxo.extend.js");

var _fluxoExtendJs2 = _interopRequireDefault(_fluxoExtendJs);

var _fluxoRadioJs = require("./fluxo.radio.js");

var _fluxoRadioJs2 = _interopRequireDefault(_fluxoRadioJs);

exports["default"] = {
  ObjectStore: _fluxoObject_storeJs2["default"],
  CollectionStore: _fluxoCollection_storeJs2["default"],
  Extend: _fluxoExtendJs2["default"],
  Radio: _fluxoRadioJs2["default"]
};
module.exports = exports["default"];

},{"./fluxo.collection_store.js":1,"./fluxo.extend.js":2,"./fluxo.object_store.js":4,"./fluxo.radio.js":5}],4:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var _fluxoRadioJs = require("./fluxo.radio.js");

var _fluxoRadioJs2 = _interopRequireDefault(_fluxoRadioJs);

var _fluxoExtendJs = require("./fluxo.extend.js");

var _fluxoExtendJs2 = _interopRequireDefault(_fluxoExtendJs);

var storesUUID = 1;

exports["default"] = {
  setup: function setup() {
    this.cid = "FS:" + storesUUID++;

    this._fluxo = true;

    var previousData = this.data;

    this.data = {};

    this.set(previousData || {});

    this.registerComputed();

    this.initialize();
  },

  initialize: function initialize() {},

  create: function create() {
    for (var _len = arguments.length, extensions = Array(_len), _key = 0; _key < _len; _key++) {
      extensions[_key] = arguments[_key];
    }

    var extension = _fluxoExtendJs2["default"].apply(undefined, [{}, this].concat(extensions));

    extension.setup.call(extension);

    return extension;
  },

  on: function on(events, callback) {
    var cancelers = [];

    for (var i = 0, l = events.length; i < l; i++) {
      var eventName = events[i],
          changeEventToken = this.cid + ":" + eventName,
          canceler = _fluxoRadioJs2["default"].subscribe(changeEventToken, callback.bind(this));

      cancelers.push(canceler);
    }

    var aggregatedCanceler = function aggregatedCanceler() {
      for (var i = 0, l = cancelers.length; i < l; i++) {
        var canceler = cancelers[i];
        canceler.call();
      }
    };

    return aggregatedCanceler;
  },

  triggerEvents: function triggerEvents(eventsNames) {
    for (var _len2 = arguments.length, args = Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
      args[_key2 - 1] = arguments[_key2];
    }

    for (var i = 0, l = eventsNames.length; i < l; i++) {
      var eventName = eventsNames[i];
      this.triggerEvent.apply(this, [eventName].concat(args));
    }
  },

  triggerEvent: function triggerEvent(eventName) {
    var changeChannel = this.cid + ":" + eventName;

    for (var _len3 = arguments.length, args = Array(_len3 > 1 ? _len3 - 1 : 0), _key3 = 1; _key3 < _len3; _key3++) {
      args[_key3 - 1] = arguments[_key3];
    }

    _fluxoRadioJs2["default"].publish.apply(_fluxoRadioJs2["default"], [changeChannel, this].concat(args));

    _fluxoRadioJs2["default"].publish.apply(_fluxoRadioJs2["default"], [this.cid + ":*", eventName, this].concat(args));
  },

  computed: {},

  attributeParsers: {},

  registerComputed: function registerComputed() {
    var computeValue = function computeValue(attrName) {
      var value = this[attrName].call(this);
      this.setAttribute(attrName, value);
    };

    for (var attributeName in this.computed) {
      var toComputeEvents = this.computed[attributeName];

      this.on(toComputeEvents, computeValue.bind(this, attributeName));

      this.setAttribute(attributeName, this[attributeName].call(this));
    }
  },

  setAttribute: function setAttribute(attribute, value, options) {
    options = options || {};

    if (this.data[attribute] === value) {
      return;
    }

    if (this.attributeParsers[attribute]) {
      value = this.attributeParsers[attribute](value);
    }

    this.data[attribute] = value;

    this.triggerEvent("change:" + attribute);

    if (options.silentGlobalChange) {
      return;
    }

    this.triggerEvent("change");
  },

  unsetAttribute: function unsetAttribute(attribute, options) {
    options = options || {};

    delete this.data[attribute];

    this.triggerEvent("change:" + attribute);

    if (options.silentGlobalChange) {
      return;
    }

    this.triggerEvent("change");
  },

  set: function set(data) {
    for (var key in data) {
      this.setAttribute(key, data[key], { silentGlobalChange: true });
    }

    this.triggerEvent("change");
  },

  reset: function reset(data) {
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

  toJSON: function toJSON() {
    var data = JSON.parse(JSON.stringify(this.data));
    data.cid = this.cid;

    return data;
  }
};
module.exports = exports["default"];

},{"./fluxo.extend.js":2,"./fluxo.radio.js":5}],5:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = {
  callbackIds: 1,

  events: {},

  subscribe: function subscribe(eventName, callback) {
    var subscriptionId = this.callbackIds++;

    this.events[eventName] = this.events[eventName] || {};
    this.events[eventName][subscriptionId] = callback;

    return this.removeSubscription.bind(this, eventName, subscriptionId);
  },

  removeSubscription: function removeSubscription(eventName, subscriptionId) {
    this.events[eventName] = this.events[eventName] || {};
    delete this.events[eventName][subscriptionId];
  },

  publish: function publish(eventName) {
    var callbacks = this.events[eventName] || {};

    for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
      args[_key - 1] = arguments[_key];
    }

    for (var subscriptionId in callbacks) {
      callbacks[subscriptionId].apply(null, args);
    }
  }
};
module.exports = exports["default"];

},{}]},{},[3])(3)
});