import ObjectStore from "./fluxo.object_store.js";

/** @namespace Fluxo */
/**
 * Fluxo.CollectionStore is a convenient wrapper to your literal objects arrays.
 */
export default class CollectionStore extends ObjectStore {
/** @lends Fluxo.CollectionStore */
  initialize (stores=[], data={}) {
    this.store = this.constructor.store || ObjectStore;

    this.stores = [];

    this.storesOnChangeCancelers = {};

    this.subsets = {};

    this.subset = (this.constructor.subset || {});

    this.childrenDelegate = (this.constructor.childrenDelegate || []);

    super.initialize(data);

    this.setStores(stores);

    this.registerSubsets();

    this.createDelegateMethods();
  }

  getSubset (subsetName) {
    if (!this[subsetName]) {
      throw new Error(`Subset compute function to "${subsetName}" subset is not defined.`);
    }

    var subsetStores = this[subsetName].call(this);

    return (new CollectionStore(subsetStores));
  }

  updateSubset (subsetName) {
    var currentValue = this.subset[subsetName];

    if ((currentValue instanceof CollectionStore)) {
      currentValue.removeAll();
    }

    this.subsets[subsetName] = this.getSubset(subsetName);

    this.triggerEvents(["change", `change:${subsetName}`]);
  }

  registerSubsets () {
    for (var subsetName in this.subset) {
      var toComputeEvents = ["add", "remove", ...this.subset[subsetName]];

      this.on(toComputeEvents, this.updateSubset.bind(this, subsetName));

      this.updateSubset(subsetName);
    }
  }

  setAttribute (attributeName, ...args) {
    if (this.subset && this.subset[attributeName]) {
      throw new Error(`The attribute name "${attributeName}" is reserved to a subset.`);
    }

    if (attributeName === "stores") {
      throw new Error(`You can't set a attribute with "stores" name on a collection.`);
    }

    return super.setAttribute(...arguments);
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
    if (!this.store.prototype[methodName]) {
      console.warn(`The "${methodName}" children delegated method doesn't exists on children store class`);
    }

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

  subsetsToJSON () {
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
  toJSON () {
    return {
      ...super.toJSON(),
      ...this.subsetsToJSON(),
      stores: this.storesToJSON()
    };
  }
}
