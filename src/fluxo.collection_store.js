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
