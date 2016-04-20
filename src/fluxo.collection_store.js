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

    this.index = {};

    this.storesOnChangeCancelers = {};

    this.subsets = {};

    this.subset = (this.constructor.subset || {});

    this.childrenDelegate = (this.constructor.childrenDelegate || []);

    super.initialize(data);

    this.setStores(stores);

    this.registerSubsets();

    this.createDelegateMethods();
  }

  firstComputation () {
    for (var subsetName in this.subset) {
      this.updateSubset(subsetName);
    }

    super.firstComputation();
  }

  getSubset (subsetName) {
    if (!this[subsetName]) {
      throw new Error(`Subset compute function to "${subsetName}" subset is not defined.`);
    }

    return this[subsetName].call(this);
  }

  updateSubset (subsetName) {
    if (!this.subsets[subsetName]) {
      this.subsets[subsetName] = new CollectionStore();
    }

    this.subsets[subsetName].resetStores(
      this.getSubset(subsetName),
      { releaseStores: false }
    );

    this.triggerEvents(["change", `change:${subsetName}`]);
  }

  registerSubsets () {
    for (var subsetName in this.subset) {
      var toComputeEvents = ["add", "remove", ...this.subset[subsetName]];
      this.on(toComputeEvents, this.updateSubset.bind(this, subsetName));
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

      if (!child) {
        throw new Error(`You tried call the delegated method "${method}" on a missing child store.`);
      }

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
  resetStores (stores=[], options={}) {
    this.removeAll(options);
    this.addStores(stores);
  }

  /**
   * @returns {null}
   * @instance
   */
  removeAll (options={}) {
    options = { releaseStores: true, ...options };

    for (var i = (this.stores.length - 1), l = 0; i >= l; i--) {
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
  setStores (storesData, options={}) {
    options = { removeMissing: false, ...options };

    let storeMap = {};

    for (let i = 0, l = this.stores.length; i < l; i++) {
      let store = this.stores[i];

      if (store.data.id) {
        storeMap[store.data.id] = store;
      } else {
        storeMap[store.cid] = store;
      }
    }

    for (let i = 0, l = storesData.length; i < l; i++) {
      let store = storesData[i],
          identifier = (store.id || (store.data && store.data.id) || store.cid),
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
      for (let identifier in storeMap) {
        let store = storeMap[identifier];
        this.remove(store, options);
      }
    }
  }

  setStore (data) {
    let alreadyAddedStore = this.find(data.id || data.cid),
        store;

    if (alreadyAddedStore) {
      store = alreadyAddedStore;
      alreadyAddedStore.set(data);
    } else {
      store = this.addStore(data);
    }

    return store;
  }

  makeSort () {
    if (!this.sort) { return; }
    this.stores.sort(this.sort);
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

    if (store instanceof this.store && store.released) {
      throw new Error(`You can't add a released store on collection.`);
    }

    var alreadyAddedStore = this.find(store.cid || store.data.id);

    if (alreadyAddedStore) { return alreadyAddedStore; }

    this.stores.push(store);

    var onStoreEvent = function(eventName, ...args) {
      this.triggerEvent(`stores:${eventName}`, ...args);

      if (eventName === "change") {
        this.makeSort();
      }

      if (eventName === "change:id") {
        let changedStore = args[0],
            previousId = args[1];

        if (previousId) {
          delete this.index[previousId];
        }

        if (changedStore.data.id) {
          this.index[changedStore.data.id] = changedStore;
        }
      }
    };

    this.storesOnChangeCancelers[store.cid] =
      store.on(["*"], onStoreEvent.bind(this));

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
  find (storeIDorCid) {
    return this.index[storeIDorCid];
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
  remove (store, options={}) {
    options = { release: false, silent: false, ...options };

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

  releaseSubsets () {
    for (var subsetName in this.subsets) {
      this.subsets[subsetName].release({ releaseStores: false });
      delete this.subsets[subsetName];
    }
  }

  release (options={}) {
    super.release();

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
