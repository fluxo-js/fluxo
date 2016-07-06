import ObjectStore from "./fluxo.object_store.js";

/** @namespace Fluxo */
/**
 * Fluxo.CollectionStore is a convenient wrapper to your literal objects arrays.
 */
export default class CollectionStore extends ObjectStore {
/** @lends Fluxo.CollectionStore */
  initialize (stores=[], data={}, options={}) {
    this.options = options;

    this.store = this.options.store || this.constructor.store || ObjectStore;

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

    this.on(["change:stores"], function () {
      delete this.lastGeneratedJSON;
    });
  }

  firstComputation () {
    for (let subsetName in this.subset) {
      this.updateSubset(subsetName);
    }

    super.firstComputation();
  }

  getSubset (subsetName) {
    if (!this[subsetName]) {
      throw new Error(`Subset compute function to "${subsetName}" subset is not defined.`);
    }

    let result = this[subsetName].call(this);

    if (!result || result.constructor !== Array) {
      throw new Error(`The subset "${subsetName}" computer function returned a value that isn't an array.`);
    }

    return result;
  }

  updateSubset (subsetName) {
    if (!this.subsets[subsetName]) {
      this.subsets[subsetName] = new CollectionStore();
    }

    this.subsets[subsetName].resetStores(this.getSubset(subsetName));

    this.triggerEvent(`change:${subsetName}`);
  }

  registerSubsets () {
    for (let subsetName in this.subset) {
      let toComputeEvents = this.subset[subsetName];

      if (toComputeEvents.indexOf("change") !== -1 && toComputeEvents.length > 1) {
        throw new Error(`You can't register a SUBSET (${this.constructor.name}#${subsetName}) with the "change" event and other events. The "change" event will be called on every change so you don't need complement with other events.`);
      }

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
    for (let i = 0, l = this.childrenDelegate.length; i < l; i++) {
      let methodName = this.childrenDelegate[i];
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
  addStores (stores, options={ silentGlobalChange: false }) {
    for (let i = 0, l = stores.length; i < l; i++) {
      let store = stores[i];
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
  resetStores (stores=[]) {
    this.removeAll({ silentGlobalChange: true });
    this.addStores(stores, { silentGlobalChange: true });
    this.triggerEvent("change");
  }

  /**
   * @returns {null}
   * @instance
   */
  removeAll (options={ silentGlobalChange: false }) {
    for (let i = (this.stores.length - 1), l = 0; i >= l; i--) {
      let store = this.stores[i];
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
        found.set(store, { silentGlobalChange: true });
      } else {
        this.addStore(store, { silentGlobalChange: true });
      }
    }

    if (options.removeMissing) {
      for (let identifier in storeMap) {
        let store = storeMap[identifier];
        this.remove(store, { silentGlobalChange: true });
      }
    }

    this.triggerEvent("change");
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
  addStore (store, options={ silentGlobalChange: false }) {
    if (!(store instanceof this.store)) {
      store = new this.store(store);
    }

    var alreadyAddedStore = this.find(store.cid || store.data.id);

    if (alreadyAddedStore) { return alreadyAddedStore; }

    this.stores.push(store);

    var onStoreEvent = function(eventName, ...args) {
      this.triggerEvent(`stores:${eventName}`, ...args);

      if (eventName === "change") {
        this.makeSort();
        this.triggerEvent("change");
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

    for (let i = 0, l = this.stores.length; i < l; i++) {
      let comparedStore = this.stores[i],
          matchAllCriteria = true;

      for (let key in criteria) {
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
    options = { silentGlobalChange: false, ...options };

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

    for (let i = 0, l = this.stores.length; i < l; i++) {
      let store = this.stores[i];
      collectionData.push(store.toJSON());
    }

    return collectionData;
  }

  subsetsToJSON () {
    var subsetsData = {};

    for (let subsetName in this.subsets) {
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
    if (!this.lastGeneratedJSON) {
      this.lastGeneratedJSON = {
        ...this.attributesToJSON(),
        ...this.subsetsToJSON(),
        stores: this.storesToJSON()
      };
    }

    return this.lastGeneratedJSON;
  }
}
