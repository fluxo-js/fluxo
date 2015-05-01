(function(root, factory) {
  if (typeof define === "function" && define.amd) {
    define([], factory);
  } else if (typeof exports !== "undefined") {
    return module.exports = factory();
  } else {
    factory();
  }
})(this, function() {
  this.Fluxo = {};

  Fluxo.extend = function(toExtend, extension) {
    for (var extensionProperty in extension) {
      toExtend[extensionProperty] = extension[extensionProperty];
    }
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
        callbacks[subscriptionId].apply(null, Array.prototype.slice.call(arguments, 1))
      }
    }
  };

  Fluxo.Store = function(data, options) {
    this.data = data || {};
    this.options = options || {};
    this.changeEventToken = Math.random().toString().slice(2, 11);
  };

  Fluxo.Store.extend = extend;

  Fluxo.Store.prototype = {
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

  Fluxo.CollectionStore = function(stores, options) {
    this.changeEventToken = Math.random().toString().slice(2, 11);
    this.stores = [];
    this.options = options || {};

    stores = (stores || []);

    for (var i = 0, l = stores.length; i < l; i ++) {
      this.addFromData(stores[i]);
    }
  };

  Fluxo.CollectionStore.extend = extend;

  Fluxo.CollectionStore.prototype = {
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
});
