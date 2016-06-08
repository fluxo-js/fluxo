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

      this.onChangeSubsets = [];

      this.childrenDelegate = this.constructor.childrenDelegate || [];

      _get(Object.getPrototypeOf(CollectionStore.prototype), "initialize", this).call(this, data);

      this.setStores(stores);

      this.registerSubsets();

      this.createDelegateMethods();

      this.on(["change:stores"], function () {
        delete this.lastGeneratedJSON;
      });
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

      var result = this[subsetName].call(this);

      if (!result || result.constructor !== Array) {
        throw new Error("The subset \"" + subsetName + "\" computer function returned a value that isn't an array.");
      }

      return result;
    }
  }, {
    key: "updateSubset",
    value: function updateSubset(subsetName) {
      if (!this.subsets[subsetName]) {
        this.subsets[subsetName] = new CollectionStore();
      }

      this.subsets[subsetName].resetStores(this.getSubset(subsetName));

      this.triggerEvent("change:" + subsetName);
    }
  }, {
    key: "registerSubsets",
    value: function registerSubsets() {
      for (var subsetName in this.subset) {
        var toComputeEvents = this.subset[subsetName];

        if (toComputeEvents.indexOf("change") !== -1 && toComputeEvents.length > 1) {
          throw new Error("You can't register a SUBSET (" + this.constructor.name + "#" + subsetName + ") with the \"change\" event and other events. The \"change\" event will be called on every change so you don't need complement with other events.");
        }

        if (toComputeEvents.indexOf("change") === 1) {
          this.onChangeSubsets.push(subsetName);
        } else {
          this.on(toComputeEvents, this.updateSubset.bind(this, subsetName));
        }
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
      var options = arguments.length <= 1 || arguments[1] === undefined ? { silentGlobalChange: false } : arguments[1];

      for (var i = 0, l = stores.length; i < l; i++) {
        var store = stores[i];
        this.addStore(store, { silentGlobalChange: true });
      }

      if (!options.silentGlobalChange) {
        this.triggerEvent("change");
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

      this.removeAll({ silentGlobalChange: true });
      this.addStores(stores, { silentGlobalChange: true });
      this.triggerEvent("change");
    }

    /**
     * @returns {null}
     * @instance
     */
  }, {
    key: "removeAll",
    value: function removeAll() {
      var options = arguments.length <= 0 || arguments[0] === undefined ? { silentGlobalChange: false } : arguments[0];

      for (var i = this.stores.length - 1, l = 0; i >= l; i--) {
        var store = this.stores[i];
        this.remove(store, { silentGlobalChange: true });
      }

      this.stores = [];

      if (!options.silentGlobalChange) {
        this.triggerEvent("change");
      }
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
          found.set(store, { silentGlobalChange: true });
        } else {
          this.addStore(store, { silentGlobalChange: true });
        }
      }

      if (options.removeMissing) {
        for (var identifier in storeMap) {
          var store = storeMap[identifier];
          this.remove(store, { silentGlobalChange: true });
        }
      }

      this.triggerEvent("change");
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
      var options = arguments.length <= 1 || arguments[1] === undefined ? { silentGlobalChange: false } : arguments[1];

      if (!(store instanceof this.store)) {
        store = new this.store(store);
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
          this.triggerEvent("change");
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

      this.triggerEvent("add");

      if (!options.silentGlobalChange) {
        this.triggerEvent("change");
      }

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

      options = _extends({ silentGlobalChange: false }, options);

      this.removeListenersOn(store);

      this.stores.splice(this.stores.indexOf(store), 1);

      this.makeSort();

      delete this.index[store.cid];

      if (store.data.id) {
        delete this.index[store.data.id];
      }

      this.triggerEvent("remove");

      if (!options.silentGlobalChange) {
        this.triggerEvent("change");
      }
    }
  }, {
    key: "computeOnChangeSubsets",
    value: function computeOnChangeSubsets() {
      for (var i = 0, l = this.onChangeSubsets.length; i < l; i++) {
        this.updateSubset(this.onChangeSubsets[i]);
      }
    }
  }, {
    key: "beforeTriggerEvent",
    value: function beforeTriggerEvent(eventName) {
      _get(Object.getPrototypeOf(CollectionStore.prototype), "beforeTriggerEvent", this).call(this, eventName);

      if (eventName === "change") {
        this.computeOnChangeSubsets();
      }
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
      if (!this.lastGeneratedJSON) {
        this.lastGeneratedJSON = _extends({}, this.attributesToJSON(), this.subsetsToJSON(), {
          stores: this.storesToJSON()
        });
      }

      return this.lastGeneratedJSON;
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
exports["default"] = {
  parser: function parser(value) {
    return value;
  },
  dump: function dump(value) {
    if (value === undefined) {
      return;
    }
    return JSON.parse(JSON.stringify(value));
  }
};
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

exports["default"] = {
  ObjectStore: _fluxoObject_storeJs2["default"],
  CollectionStore: _fluxoCollection_storeJs2["default"]
};
module.exports = exports["default"];

},{"./fluxo.collection_store.js":1,"./fluxo.object_store.js":4}],4:[function(_dereq_,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _fluxoDefault_attribute_contractJs = _dereq_("./fluxo.default_attribute_contract.js");

var _fluxoDefault_attribute_contractJs2 = _interopRequireDefault(_fluxoDefault_attribute_contractJs);

var storesUUID = 1;

var ObjectStore = (function () {
  function ObjectStore() {
    _classCallCheck(this, ObjectStore);

    this.initialize.apply(this, arguments);
    this.firstComputation();
  }

  _createClass(ObjectStore, [{
    key: "initialize",
    value: function initialize() {
      var data = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

      this.cid = "FS:" + storesUUID++;

      this.data = {};

      this.storeAttributesEventsCanceler = {};

      this.computed = this.constructor.computed || {};

      this.onChangeComputedProperties = [];

      this.attributeParsers = this.constructor.attributeParsers || {};

      this.signedEventsCancelers = [];

      this.events = {};

      this.setDefaults();

      this.set(data);

      this.registerComputed();

      this.on(["change"], function () {
        delete this.lastGeneratedJSON;
      });

      this.warnMissingAttributes();
    }
  }, {
    key: "warnMissingAttributes",
    value: function warnMissingAttributes() {
      if (!this.constructor.attributes) {
        return;
      }

      for (var attributeName in this.constructor.attributes) {
        this.warnMissingAttribute(attributeName, this.data[attributeName]);
      }
    }
  }, {
    key: "warnMissingAttribute",
    value: function warnMissingAttribute(attributeName, value) {
      if (!this.contract(attributeName).required) {
        return;
      }

      if (!(value === undefined || value === null)) {
        return;
      }

      var identifier = "";

      if (this.data.id) {
        identifier = "id: " + this.data.id;
      } else {
        identifier = "cid: " + this.cid;
      }

      var message = "Warning: missing the required \"" + attributeName + "\" attribute on the \"" + this.constructor.name + "\" store (" + identifier + ")";

      if (console.warn) {
        console.warn(message);
      } else {
        console(message);
      }
    }
  }, {
    key: "getDefaults",
    value: function getDefaults() {
      if (!this.constructor.attributes) {
        return;
      }

      var defaults = {};

      for (var attributeName in this.constructor.attributes) {
        defaults[attributeName] = this.contract(attributeName).defaultValue;
      }

      return JSON.parse(JSON.stringify(defaults));
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
    key: "subscribe",
    value: function subscribe(eventName, callback) {
      if (typeof callback !== "function") {
        throw new Error("Callback must be a function");
      }

      this.events[eventName] = this.events[eventName] || [];

      this.events[eventName].push(callback);

      return this.removeSubscription.bind(this, eventName, callback);
    }
  }, {
    key: "removeSubscription",
    value: function removeSubscription(eventName, callback) {
      var index = this.events[eventName].indexOf(callback);

      this.events[eventName].splice(index, 1);

      if (!this.events[eventName]) {
        delete this.events[eventName];
      }
    }
  }, {
    key: "publish",
    value: function publish(eventName) {
      var callbacks = this.events[eventName];

      if (!callbacks) {
        return;
      }

      for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        args[_key - 1] = arguments[_key];
      }

      for (var i = 0; i < callbacks.length; i++) {
        callbacks[i].apply(null, args);
      }
    }
  }, {
    key: "on",
    value: function on(events, callback) {
      var cancelers = [];

      for (var i = 0, l = events.length; i < l; i++) {
        var eventName = events[i],
            changeEventToken = eventName,
            canceler = this.subscribe(changeEventToken, callback.bind(this));

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
      for (var _len2 = arguments.length, args = Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
        args[_key2 - 1] = arguments[_key2];
      }

      for (var i = 0, l = eventsNames.length; i < l; i++) {
        var eventName = eventsNames[i];
        this.triggerEvent.apply(this, [eventName].concat(args));
      }
    }
  }, {
    key: "computeOnChangeComputedProperties",
    value: function computeOnChangeComputedProperties() {
      for (var i = 0, l = this.onChangeComputedProperties.length; i < l; i++) {
        this.computeValue(this.onChangeComputedProperties[i]);
      }
    }
  }, {
    key: "beforeTriggerEvent",
    value: function beforeTriggerEvent(eventName) {
      if (eventName === "change") {
        this.computeOnChangeComputedProperties();
      }
    }
  }, {
    key: "triggerEvent",
    value: function triggerEvent(eventName) {
      this.beforeTriggerEvent(eventName);

      for (var _len3 = arguments.length, args = Array(_len3 > 1 ? _len3 - 1 : 0), _key3 = 1; _key3 < _len3; _key3++) {
        args[_key3 - 1] = arguments[_key3];
      }

      this.publish.apply(this, [eventName, this].concat(args));

      this.publish.apply(this, ["*", eventName, this].concat(args));
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
      this.setAttribute(attributeName, this.getComputed(attributeName), { silentGlobalChange: true });
    }
  }, {
    key: "registerComputed",
    value: function registerComputed() {
      for (var attributeName in this.computed) {
        var toComputeEvents = this.computed[attributeName];

        if (toComputeEvents.indexOf("change") !== -1 && toComputeEvents.length > 1) {
          throw new Error("You can't register a COMPUTED PROPERTY (" + this.constructor.name + "#" + attributeName + ") with the \"change\" event and other events. The \"change\" event will be called on every change so you don't need complement with other events.");
        }

        if (toComputeEvents.indexOf("change") === 1) {
          this.onChangeComputedProperties.push(attributeName);
        } else {
          this.on(toComputeEvents, this.computeValue.bind(this, attributeName));
        }
      }
    }
  }, {
    key: "stopListenStoreAttribute",
    value: function stopListenStoreAttribute(attributeName) {
      this.storeAttributesEventsCanceler[attributeName].call();
      delete this.storeAttributesEventsCanceler[attributeName];
    }
  }, {
    key: "listenStoreAttribute",
    value: function listenStoreAttribute(attribute, store) {
      var onStoreEvent = function onStoreEvent(attributeName, eventName) {
        if (eventName !== "change") {
          for (var _len4 = arguments.length, args = Array(_len4 > 2 ? _len4 - 2 : 0), _key4 = 2; _key4 < _len4; _key4++) {
            args[_key4 - 2] = arguments[_key4];
          }

          this.triggerEvent.apply(this, ["change:" + attributeName + ":" + eventName.replace(/^change:/, '')].concat(args));
        }

        if (eventName === "change" || eventName === "stores:change") {
          this.triggerEvent("change:" + attributeName);
          this.triggerEvent("change");
        }
      };

      this.storeAttributesEventsCanceler[attribute] = store.on(["*"], onStoreEvent.bind(this, attribute));
    }
  }, {
    key: "contract",
    value: function contract(attributeName) {
      if (this.constructor.attributes && this.constructor.attributes[attributeName]) {
        return this.constructor.attributes[attributeName];
      } else {
        return {};
      }
    }
  }, {
    key: "parser",
    value: function parser(attributeName) {
      return this.contract(attributeName).parser || _fluxoDefault_attribute_contractJs2["default"].parser;
    }
  }, {
    key: "dump",
    value: function dump(attributeName) {
      return this.contract(attributeName).dump || _fluxoDefault_attribute_contractJs2["default"].dump;
    }
  }, {
    key: "setAttribute",
    value: function setAttribute(attribute, value, options) {
      if (typeof attribute !== "string") {
        throw new Error("The \"attribute\" argument on store's \"setAttribute\" function must be a string.");
      }

      options = options || {};

      if (this.data[attribute] === value) {
        return;
      }

      delete this.lastGeneratedJSON;

      value = this.parser(attribute).call(this, value);

      this.warnMissingAttribute(attribute, value);

      if (this.data[attribute] instanceof ObjectStore) {
        this.stopListenStoreAttribute(attribute);
      }

      if (value instanceof ObjectStore) {
        this.listenStoreAttribute(attribute, value);
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

      this.warnMissingAttribute(attribute);

      if (this.data[attribute] instanceof ObjectStore) {
        this.stopListenStoreAttribute(attribute);
      }

      delete this.data[attribute];

      this.triggerEvent("change:" + attribute);

      if (options.silentGlobalChange) {
        return;
      }

      this.triggerEvent("change");
    }
  }, {
    key: "set",
    value: function set(data) {
      var options = arguments.length <= 1 || arguments[1] === undefined ? { silentGlobalChange: false } : arguments[1];

      if (typeof data !== "object") {
        throw new Error("The \"data\" argument on store's \"set\" function must be an object.");
      }

      for (var key in data) {
        this.setAttribute(key, data[key], { silentGlobalChange: true });
      }

      if (!options.silentGlobalChange) {
        this.triggerEvent("change");
      }
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
    key: "attributesToJSON",
    value: function attributesToJSON() {
      var data = {};

      for (var attributeName in this.data) {
        data[attributeName] = this.dump(attributeName).call(this, this.data[attributeName]);
      }

      return _extends({}, data, { cid: this.cid });
    }
  }, {
    key: "toJSON",
    value: function toJSON() {
      if (!this.lastGeneratedJSON) {
        this.lastGeneratedJSON = this.attributesToJSON();
      }

      return this.lastGeneratedJSON;
    }
  }]);

  return ObjectStore;
})();

;

exports["default"] = ObjectStore;
module.exports = exports["default"];

},{"./fluxo.default_attribute_contract.js":2}]},{},[3])(3)
});