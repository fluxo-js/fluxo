/*! fluxo-js v0.0.23 | (c) 2014, 2016 Samuel Simões | https://github.com/fluxo-js/fluxo */
(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.Fluxo = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(_dereq_,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x9, _x10, _x11) { var _again = true; _function: while (_again) { var object = _x9, property = _x10, receiver = _x11; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x9 = parent; _x10 = property; _x11 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _fluxoObject_storeJs = _dereq_("./fluxo.object_store.js");

var _fluxoObject_storeJs2 = _interopRequireDefault(_fluxoObject_storeJs);

/** @namespace Fluxo */
/**
 * Fluxo.CollectionStore is a convenient wrapper to your literal objects arrays.
 */

var CollectionStore = (function (_ObjectStore) {
  _inherits(CollectionStore, _ObjectStore);

  function CollectionStore() {
    _classCallCheck(this, CollectionStore);

    _get(Object.getPrototypeOf(CollectionStore.prototype), "constructor", this).apply(this, arguments);
  }

  _createClass(CollectionStore, [{
    key: "initialize",

    /** @lends Fluxo.CollectionStore */
    value: function initialize() {
      var stores = arguments.length <= 0 || arguments[0] === undefined ? [] : arguments[0];
      var data = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

      this.store = this.constructor.store || _fluxoObject_storeJs2["default"];

      this.stores = [];

      this.index = {};

      this.storesOnChangeCancelers = {};

      this.subsets = {};

      this.subset = this.constructor.subset || {};

      this.childrenDelegate = this.constructor.childrenDelegate || [];

      _get(Object.getPrototypeOf(CollectionStore.prototype), "initialize", this).call(this, data);

      this.setStores(stores);

      this.registerSubsets();

      this.createDelegateMethods();
    }
  }, {
    key: "firstComputation",
    value: function firstComputation() {
      for (var subsetName in this.subset) {
        this.updateSubset(subsetName);
      }

      _get(Object.getPrototypeOf(CollectionStore.prototype), "firstComputation", this).call(this);
    }
  }, {
    key: "getSubset",
    value: function getSubset(subsetName) {
      if (!this[subsetName]) {
        throw new Error("Subset compute function to \"" + subsetName + "\" subset is not defined.");
      }

      return this[subsetName].call(this);
    }
  }, {
    key: "updateSubset",
    value: function updateSubset(subsetName) {
      if (!this.subsets[subsetName]) {
        this.subsets[subsetName] = new CollectionStore();
      }

      this.subsets[subsetName].resetStores(this.getSubset(subsetName), { releaseStores: false });

      this.triggerEvents(["change", "change:" + subsetName]);
    }
  }, {
    key: "registerSubsets",
    value: function registerSubsets() {
      for (var subsetName in this.subset) {
        var toComputeEvents = ["add", "remove"].concat(_toConsumableArray(this.subset[subsetName]));
        this.on(toComputeEvents, this.updateSubset.bind(this, subsetName));
      }
    }
  }, {
    key: "setAttribute",
    value: function setAttribute(attributeName) {
      for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        args[_key - 1] = arguments[_key];
      }

      if (this.subset && this.subset[attributeName]) {
        throw new Error("The attribute name \"" + attributeName + "\" is reserved to a subset.");
      }

      if (attributeName === "stores") {
        throw new Error("You can't set a attribute with \"stores\" name on a collection.");
      }

      return _get(Object.getPrototypeOf(CollectionStore.prototype), "setAttribute", this).apply(this, arguments);
    }

    /**
     * @returns {null}
     */
  }, {
    key: "createDelegateMethods",
    value: function createDelegateMethods() {
      for (var i = 0, l = this.childrenDelegate.length; i < l; i++) {
        var methodName = this.childrenDelegate[i];
        this.createDelegateMethod(methodName);
      }
    }

    /**
     * @param {string} method to delegate to children
     * @returns {null}
     */
  }, {
    key: "createDelegateMethod",
    value: function createDelegateMethod(methodName) {
      if (!this.store.prototype[methodName]) {
        console.warn("The \"" + methodName + "\" children delegated method doesn't exists on children store class");
      }

      this[methodName] = (function (method, id) {
        var child = this.find(id);

        if (!child) {
          throw new Error("You tried call the delegated method \"" + method + "\" on a missing child store.");
        }

        for (var _len2 = arguments.length, args = Array(_len2 > 2 ? _len2 - 2 : 0), _key2 = 2; _key2 < _len2; _key2++) {
          args[_key2 - 2] = arguments[_key2];
        }

        child[method].apply(child, args);
      }).bind(this, methodName);
    }

    /**
     * @param {Object[]} stores data
     * @returns {null}
     */
  }, {
    key: "addStores",
    value: function addStores(stores) {
      for (var i = 0, l = stores.length; i < l; i++) {
        var store = stores[i];
        this.addStore(store);
      }
    }

    /**
     * @param {Object[]} stores data
     * @returns {null}
     */
  }, {
    key: "resetStores",
    value: function resetStores() {
      var stores = arguments.length <= 0 || arguments[0] === undefined ? [] : arguments[0];
      var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

      this.removeAll(options);
      this.addStores(stores);
    }

    /**
     * @returns {null}
     * @instance
     */
  }, {
    key: "removeAll",
    value: function removeAll() {
      var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

      options = _extends({ releaseStores: true }, options);

      for (var i = this.stores.length - 1, l = 0; i >= l; i--) {
        var store = this.stores[i];
        this.remove(store, { silent: true, release: options.releaseStores });
      }

      this.stores = [];

      this.triggerEvents(["remove", "change"]);
    }

    /**
     * This methods add the missing objects and updates the existing stores.
     *
     * @param {Object[]} stores data
     * @returns undefined
     * @instance
     */
  }, {
    key: "setStores",
    value: function setStores(storesData) {
      var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

      options = _extends({ removeMissing: false }, options);

      var storeMap = {};

      for (var i = 0, l = this.stores.length; i < l; i++) {
        var store = this.stores[i];

        if (store.data.id) {
          storeMap[store.data.id] = store;
        } else {
          storeMap[store.cid] = store;
        }
      }

      for (var i = 0, l = storesData.length; i < l; i++) {
        var store = storesData[i],
            identifier = store.id || store.data && store.data.id || store.cid,
            found = storeMap[identifier];

        if (found) {
          delete storeMap[identifier];
        }

        if (found && !store.cid) {
          found.set(store);
        } else {
          this.addStore(store);
        }
      }

      if (options.removeMissing) {
        for (var identifier in storeMap) {
          var store = storeMap[identifier];
          this.remove(store, options);
        }
      }
    }
  }, {
    key: "setStore",
    value: function setStore(data) {
      var alreadyAddedStore = this.find(data.id || data.cid),
          store = undefined;

      if (alreadyAddedStore) {
        store = alreadyAddedStore;
        alreadyAddedStore.set(data);
      } else {
        store = this.addStore(data);
      }

      return store;
    }
  }, {
    key: "makeSort",
    value: function makeSort() {
      if (!this.sort) {
        return;
      }
      this.stores.sort(this.sort);
    }

    /**
     * @param {Object} store data
     * @returns {Object}
     * @instance
     */
  }, {
    key: "addStore",
    value: function addStore(store) {
      if (!(store instanceof this.store)) {
        store = new this.store(store);
      }

      if (store instanceof this.store && store.released) {
        throw new Error("You can't add a released store on collection.");
      }

      var alreadyAddedStore = this.find(store.cid || store.data.id);

      if (alreadyAddedStore) {
        return alreadyAddedStore;
      }

      this.stores.push(store);

      var onStoreEvent = function onStoreEvent(eventName) {
        for (var _len3 = arguments.length, args = Array(_len3 > 1 ? _len3 - 1 : 0), _key3 = 1; _key3 < _len3; _key3++) {
          args[_key3 - 1] = arguments[_key3];
        }

        this.triggerEvent.apply(this, ["stores:" + eventName].concat(args));

        if (eventName === "change") {
          this.makeSort();
        }

        if (eventName === "change:id") {
          var changedStore = args[0],
              previousId = args[1];

          if (previousId) {
            delete this.index[previousId];
          }

          if (changedStore.data.id) {
            this.index[changedStore.data.id] = changedStore;
          }
        }
      };

      this.storesOnChangeCancelers[store.cid] = store.on(["*"], onStoreEvent.bind(this));

      this.makeSort();

      this.index[store.cid] = store;

      if (store.data.id) {
        this.index[store.data.id] = store;
      }

      this.triggerEvents(["add", "change"]);

      return store;
    }

    /**
     * @param {number} storeID
     * @returns {Object|undefined} - the found flux store or undefined
     * @instance
     */
  }, {
    key: "find",
    value: function find(storeIDorCid) {
      return this.index[storeIDorCid];
    }

    /**
     * @param {Object} criteria
     * @returns {Object|undefined} - the found flux store or undefined
     * @instance
     */
  }, {
    key: "findWhere",
    value: function findWhere(criteria) {
      return this.where(criteria, true)[0];
    }

    /**
     * @param {Object} criteria
     * @returns {Fluxo.ObjectStore[]} - the found flux stores or empty array
     * @instance
     */
  }, {
    key: "where",
    value: function where(criteria, stopOnFirstMatch) {
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
    }

    /**
     * @returns {null}
     * @instance
     */
  }, {
    key: "removeListenersOn",
    value: function removeListenersOn(store) {
      this.storesOnChangeCancelers[store.cid].call();
      delete this.storesOnChangeCancelers[store.cid];
    }

    /**
     * @param {Fluxo.ObjectStore} store - the store to remove
     * @returns {null}
     * @instance
     */
  }, {
    key: "remove",
    value: function remove(store) {
      var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

      options = _extends({ release: false, silent: false }, options);

      this.removeListenersOn(store);

      this.stores.splice(this.stores.indexOf(store), 1);

      if (options.release) {
        store.release();
      }

      this.makeSort();

      delete this.index[store.cid];

      if (store.data.id) {
        delete this.index[store.data.id];
      }

      if (!options.silent) {
        this.triggerEvents(["remove", "change"]);
      }
    }
  }, {
    key: "releaseSubsets",
    value: function releaseSubsets() {
      for (var subsetName in this.subsets) {
        this.subsets[subsetName].release({ releaseStores: false });
        delete this.subsets[subsetName];
      }
    }
  }, {
    key: "release",
    value: function release() {
      var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

      _get(Object.getPrototypeOf(CollectionStore.prototype), "release", this).call(this);

      this.removeAll(options);

      this.releaseSubsets();
    }

    /**
     * It returns an array with the result of toJSON method invoked
     * on each stores.
     *
     * @returns {Object}
     *
     * @instance
     */
  }, {
    key: "storesToJSON",
    value: function storesToJSON() {
      var collectionData = [];

      for (var i = 0, l = this.stores.length; i < l; i++) {
        var store = this.stores[i];
        collectionData.push(store.toJSON());
      }

      return collectionData;
    }
  }, {
    key: "subsetsToJSON",
    value: function subsetsToJSON() {
      var subsetsData = {};

      for (var subsetName in this.subsets) {
        subsetsData[subsetName] = this.subsets[subsetName].toJSON().stores;
      }

      return subsetsData;
    }

    /**
     * It returns a JSON with the store's attributes, the children stores data
     * on "stores" key and the subsets store's data.
     *
     * e.g {
     *   usersCount: 1,
     *   onlineUsers: [{ name: "Fluxo" }],
     *   stores: [{ name: "Fluxo" }]
     * }
     *
     * @returns {Object}
     *
     * @instance
     */
  }, {
    key: "toJSON",
    value: function toJSON() {
      return _extends({}, _get(Object.getPrototypeOf(CollectionStore.prototype), "toJSON", this).call(this), this.subsetsToJSON(), {
        stores: this.storesToJSON()
      });
    }
  }]);

  return CollectionStore;
})(_fluxoObject_storeJs2["default"]);

exports["default"] = CollectionStore;
module.exports = exports["default"];

},{"./fluxo.object_store.js":4}],2:[function(_dereq_,module,exports){
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

},{}],3:[function(_dereq_,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var _fluxoObject_storeJs = _dereq_("./fluxo.object_store.js");

var _fluxoObject_storeJs2 = _interopRequireDefault(_fluxoObject_storeJs);

var _fluxoCollection_storeJs = _dereq_("./fluxo.collection_store.js");

var _fluxoCollection_storeJs2 = _interopRequireDefault(_fluxoCollection_storeJs);

var _fluxoExtendJs = _dereq_("./fluxo.extend.js");

var _fluxoExtendJs2 = _interopRequireDefault(_fluxoExtendJs);

var _fluxoRadioJs = _dereq_("./fluxo.radio.js");

var _fluxoRadioJs2 = _interopRequireDefault(_fluxoRadioJs);

exports["default"] = {
  ObjectStore: _fluxoObject_storeJs2["default"],
  CollectionStore: _fluxoCollection_storeJs2["default"],
  Radio: _fluxoRadioJs2["default"],
  extend: _fluxoExtendJs2["default"]
};
module.exports = exports["default"];

},{"./fluxo.collection_store.js":1,"./fluxo.extend.js":2,"./fluxo.object_store.js":4,"./fluxo.radio.js":5}],4:[function(_dereq_,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _fluxoRadioJs = _dereq_("./fluxo.radio.js");

var _fluxoRadioJs2 = _interopRequireDefault(_fluxoRadioJs);

var _fluxoExtendJs = _dereq_("./fluxo.extend.js");

var _fluxoExtendJs2 = _interopRequireDefault(_fluxoExtendJs);

var storesUUID = 1;

var _default = (function () {
  function _default() {
    _classCallCheck(this, _default);

    this.initialize.apply(this, arguments);
    this.firstComputation();
  }

  _createClass(_default, [{
    key: "initialize",
    value: function initialize() {
      var data = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

      this.cid = "FS:" + storesUUID++;

      this.released = false;

      this.data = {};

      this.computed = this.constructor.computed || {};

      this.attributeParsers = this.constructor.attributeParsers || {};

      this.signedEventsCancelers = [];

      this.setDefaults();

      this.set(data);

      this.registerComputed();
    }
  }, {
    key: "getDefaults",
    value: function getDefaults() {
      if (!this.constructor.defaults) {
        return;
      }

      return JSON.parse(JSON.stringify(this.constructor.defaults));
    }
  }, {
    key: "setDefaults",
    value: function setDefaults() {
      var options = arguments.length <= 0 || arguments[0] === undefined ? { silentGlobalChange: false } : arguments[0];

      var data = this.getDefaults();

      for (var key in data) {
        this.setAttribute(key, data[key], options);
      }
    }
  }, {
    key: "firstComputation",
    value: function firstComputation() {
      for (var attributeName in this.computed) {
        this.computeValue(attributeName);
      }
    }
  }, {
    key: "on",
    value: function on(events, callback) {
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

      this.signedEventsCancelers.push(aggregatedCanceler);

      return aggregatedCanceler;
    }
  }, {
    key: "triggerEvents",
    value: function triggerEvents(eventsNames) {
      for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        args[_key - 1] = arguments[_key];
      }

      for (var i = 0, l = eventsNames.length; i < l; i++) {
        var eventName = eventsNames[i];
        this.triggerEvent.apply(this, [eventName].concat(args));
      }
    }
  }, {
    key: "triggerEvent",
    value: function triggerEvent(eventName) {
      var changeChannel = this.cid + ":" + eventName;

      for (var _len2 = arguments.length, args = Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
        args[_key2 - 1] = arguments[_key2];
      }

      _fluxoRadioJs2["default"].publish.apply(_fluxoRadioJs2["default"], [changeChannel, this].concat(args));

      _fluxoRadioJs2["default"].publish.apply(_fluxoRadioJs2["default"], [this.cid + ":*", eventName, this].concat(args));
    }
  }, {
    key: "getComputed",
    value: function getComputed(attributeName) {
      if (!this[attributeName]) {
        throw new Error("Compute function to \"" + attributeName + "\" value is not defined.");
      }

      return this[attributeName].call(this);
    }
  }, {
    key: "computeValue",
    value: function computeValue(attributeName) {
      this.setAttribute(attributeName, this.getComputed(attributeName));
    }
  }, {
    key: "registerComputed",
    value: function registerComputed() {
      for (var attributeName in this.computed) {
        var toComputeEvents = this.computed[attributeName];
        this.on(toComputeEvents, this.computeValue.bind(this, attributeName));
      }
    }
  }, {
    key: "setAttribute",
    value: function setAttribute(attribute, value, options) {
      if (typeof attribute !== "string") {
        throw new Error("The \"attribute\" argument on store's \"setAttribute\" function must be a string.");
      }

      if (this.released) {
        throw new Error("This store is already released and it can't be used.");
      }

      options = options || {};

      if (this.data[attribute] === value) {
        return;
      }

      delete this.lastGeneratedJSON;

      if (this.attributeParsers[attribute]) {
        value = this.attributeParsers[attribute](value);
      }

      var previousValue = this.data[attribute];

      this.data[attribute] = value;

      this.triggerEvent("change:" + attribute, previousValue);

      if (options.silentGlobalChange) {
        return;
      }

      this.triggerEvent("change");
    }
  }, {
    key: "unsetAttribute",
    value: function unsetAttribute(attribute, options) {
      options = options || {};

      delete this.data[attribute];

      delete this.lastGeneratedJSON;

      this.triggerEvent("change:" + attribute);

      if (options.silentGlobalChange) {
        return;
      }

      this.triggerEvent("change");
    }
  }, {
    key: "set",
    value: function set(data) {
      if (typeof data !== "object") {
        throw new Error("The \"data\" argument on store's \"set\" function must be an object.");
      }

      for (var key in data) {
        this.setAttribute(key, data[key], { silentGlobalChange: true });
      }

      this.triggerEvent("change");
    }
  }, {
    key: "cancelSignedEvents",
    value: function cancelSignedEvents() {
      for (var i = 0, l = this.signedEventsCancelers.length; i < l; i++) {
        var canceler = this.signedEventsCancelers[i];
        canceler.call();
      }
    }
  }, {
    key: "release",
    value: function release() {
      this.cancelSignedEvents();
      this.released = true;
    }
  }, {
    key: "reset",
    value: function reset() {
      var data = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

      var attributes = _extends({}, this.data),
          defaults = this.getDefaults();

      for (var attributeName in this.computed) {
        delete attributes[attributeName];
      }

      for (var attributeName in data) {
        this.setAttribute(attributeName, data[attributeName], { silentGlobalChange: true });
        delete attributes[attributeName];
        delete defaults[attributeName];
      }

      for (var attributeName in defaults) {
        this.setAttribute(attributeName, defaults[attributeName], { silentGlobalChange: true });
        delete attributes[attributeName];
      }

      for (var attributeName in attributes) {
        this.unsetAttribute(attributeName, { silentGlobalChange: true });
      }

      this.triggerEvent("change");
    }
  }, {
    key: "clear",
    value: function clear() {
      var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

      options = _extends({ silentGlobalChange: false }, options);

      for (var key in this.data) {
        if (!this.computed.hasOwnProperty(key)) {
          this.unsetAttribute(key, { silentGlobalChange: true });
        }
      }

      if (!options.silentGlobalChange) {
        this.triggerEvent("change");
      }
    }
  }, {
    key: "toJSON",
    value: function toJSON() {
      if (!this.lastGeneratedJSON) {
        this.lastGeneratedJSON = JSON.parse(JSON.stringify(this.data));
        this.lastGeneratedJSON.cid = this.cid;
      }

      return this.lastGeneratedJSON;
    }
  }]);

  return _default;
})();

exports["default"] = _default;
;
module.exports = exports["default"];

},{"./fluxo.extend.js":2,"./fluxo.radio.js":5}],5:[function(_dereq_,module,exports){
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
    if (this.events[eventName]) {
      delete this.events[eventName][subscriptionId];

      if (!Object.getOwnPropertyNames(this.events[eventName]).length) {
        delete this.events[eventName];
      }
    }
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