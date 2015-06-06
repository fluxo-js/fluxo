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

    this.addBunchFromData(storesData);

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
  addBunchFromData: function(storesData) {
    for (var i = 0, l = storesData.length; i < l; i ++) {
      var storeData = storesData[i];
      this.addFromData(storeData);
    }
  },

  /**
   * @param {Object[]} storesData
   * @returns {null}
   * @instance
   */
  resetFromData: function(storesData) {
    this.removeAll();
    this.addBunchFromData(storesData);
  },

  /**
   * @param {Fluxo.Store[]} stores
   * @returns {null}
   * @instance
   */
  addBunchStores: function(stores) {
    for (var i = 0, l = stores.length; i < l; i ++) {
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
    this.addBunchStores(storeData);
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
   * @param {Fluxo.Store} store
   * @returns {Fluxo.Store}
   * @instance
   */
  addStore: function(store) {
    if (this.storeAlreadyAdded(store)) { return; }

    this.stores.push(store);

    var onStoreChange = function() {
      this.trigger(["change:stores", "change"]);
    };

    this.storesOnChangeCancelers[store.changeEventToken] =
      store.on(["change"], onStoreChange.bind(this));

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
   * Verifies presence of a store on the collection
   *
   * @param {Fluxo.Store} store - the store to verify presence
   * @returns {Fluxo.Store|undefined} - the found flux store or undefined
   * @instance
   */
  storeAlreadyAdded: function (store) {
    return this.find(store.data.id);
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

    for (var i = 0, l = this.stores.length; i < l; i ++) {
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
