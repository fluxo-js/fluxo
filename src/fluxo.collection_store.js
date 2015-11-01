import ObjectStore from "./fluxo.object_store.js";

/** @namespace Fluxo */
/**
 * Fluxo.CollectionStore is a convenient wrapper to your literal objects arrays.
 */
export default class extends ObjectStore {
/** @lends Fluxo.CollectionStore */
  constructor (stores=[], data={}) {
    super(data);

    this.store = this.constructor.store || ObjectStore;

    this.stores = [];

    this.storesOnChangeCancelers = {};

    this.childrenDelegate = (this.constructor.childrenDelegate || []);

    this.setStores(stores);

    this.createDelegateMethods();
  }

  /**
   * @returns {null}
   */
  createDelegateMethods () {
    for (var i = 0, l = this.childrenDelegate.length; i < l; i++) {
      var methodName = this.childrenDelegate[i];
      this.createDelegateMethod(methodName);
    }
  }

  /**
   * @param {string} method to delegate to children
   * @returns {null}
   */
  createDelegateMethod (methodName) {
    this[methodName] = function(method, id, ...args) {
      var child = this.find(id);
      child[method](...args);
    }.bind(this, methodName);
  }

  /**
   * @param {Object[]} stores data
   * @returns {null}
   */
  addStores (stores) {
    for (var i = 0, l = stores.length; i < l; i++) {
      var store = stores[i];
      this.addStore(store);
    }
  }

  /**
   * @param {Object[]} stores data
   * @returns {null}
   */
  resetStores (stores) {
    this.removeAll();
    this.addStores(stores);
  }

  /**
   * @returns {null}
   * @instance
   */
  removeAll () {
    for (var i = (this.stores.length - 1), l = 0; i >= l; i--) {
      var store = this.stores[i];
      this.removeListenersOn(store);
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
  setStores (data) {
    for (var i = 0, l = data.length; i < l; i++) {
      var storeData = data[i],
          alreadyAddedStore = this.find(storeData.id || storeData.cid);

      if (alreadyAddedStore) {
        alreadyAddedStore.set(storeData);
      } else {
        this.addStore(storeData);
      }
    }
  }

  /**
   * @param {Object} store data
   * @returns {Object}
   * @instance
   */
  addStore (store) {
    if (!(store instanceof this.store)) {
      store = new this.store(store);
    }

    var alreadyAddedStore = this.find(store.data.id);

    if (alreadyAddedStore) { return alreadyAddedStore; }

    this.stores.push(store);

    var onStoreEvent = function(eventName, ...args) {
      this.triggerEvent(`stores:${eventName}`, ...args);
    };

    this.storesOnChangeCancelers[store.cid] =
      store.on(["*"], onStoreEvent.bind(this));

    if (this.sort) {
      this.stores.sort(this.sort);
    }

    this.triggerEvents(["add", "change"]);

    return store;
  }

  /**
   * @param {number} storeID
   * @returns {Object|undefined} - the found flux store or undefined
   * @instance
   */
  find  (storeID) {
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
  }

  /**
   * @param {Object} criteria
   * @returns {Object|undefined} - the found flux store or undefined
   * @instance
   */
  findWhere (criteria) {
    return this.where(criteria, true)[0];
  }

  /**
   * @param {Object} criteria
   * @returns {Fluxo.ObjectStore[]} - the found flux stores or empty array
   * @instance
   */
  where (criteria, stopOnFirstMatch) {
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
  }

  /**
   * @returns {null}
   * @instance
   */
  removeListenersOn (store) {
    this.storesOnChangeCancelers[store.cid].call();
    delete this.storesOnChangeCancelers[store.cid];
  }

  /**
   * @param {Fluxo.ObjectStore} store - the store to remove
   * @returns {null}
   * @instance
   */
  remove (store) {
    this.removeListenersOn(store);

    this.stores.splice(this.stores.indexOf(store), 1);

    this.triggerEvents(["remove", "change"]);
  }

  /**
   * It returns an array with the result of toJSON method invoked
   * on each stores.
   *
   * @returns {Object}
   *
   * @instance
   */
  storesToJSON () {
    var collectionData = [];

    for (var i = 0, l = this.stores.length; i < l; i++) {
      var store = this.stores[i];
      collectionData.push(store.toJSON());
    }

    return collectionData;
  }

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
  toJSON () {
    var data = JSON.parse(JSON.stringify(this.data));
    data.cid = this.cid;

    return {
      data: data,
      stores: this.storesToJSON()
    };
  }
}
