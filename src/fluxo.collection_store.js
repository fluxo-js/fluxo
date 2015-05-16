Fluxo.CollectionStore = Fluxo.Base.extend({
 _constructor: function(storesData, options) {
    // Copy data to not mutate the original object
    if (storesData) {
      storesData = JSON.parse(JSON.stringify(storesData));
    } else {
      storesData = [];
    }

    this.stores = [];

    this.addBunchFromData(storesData);

    this.initialize(storesData, options);
  },

  store: Fluxo.Store,

  storesOnChangeCancelers: {},

  /**
   * @param {Object[]} - storesData
   * @returns {null}
   */
  addBunchFromData: function(storesData) {
    for (var i = 0, l = storesData.length; i < l; i ++) {
      var storeData = storesData[i];
      this.addFromData(storeData);
    }
  },

  /**
   * @param {Fluxo.Store[]} - stores
   * @returns {null}
   */
  addBunchStores: function(stores) {
    for (var i = 0, l = stores.length; i < l; i ++) {
     var store = data[i];
     this.addStore(storeOrData);
    }
  },

  /**
   * @returns {null}
   */
  removeAll: function() {
    for (var i = (this.stores.length - 1), l = 0; i >= l; i--) {
      var store = this.stores[i];
      this.removeListenersOn(store);
    }

    this.stores = [];

    this.trigger("remove");
    this.trigger("change");
  },

  /**
   * @param {Object} data
   * @returns {Fluxo.Store}
   */
  addFromData: function(data) {
    var store = new this.store(data);

    return this.addStore(store);
  },

  /**
   * @param {Fluxo.Store} store
   * @returns {Fluxo.Store}
   */
  addStore: function(store) {
    if (this.storeAlreadyAdded(store)) { return; }

    this.stores.push(store);

    this.storesOnChangeCancelers[store.changeEventToken] =
      store.on(["change"], this.trigger.bind(this, "change"));

    this.trigger("add", store);
    this.trigger("change");

    return store;
  },

  /**
   * @param {number} storeId
   * @returns {Fluxo.Store|undefined} - the found flux store or undefined
   */
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

  /**
   * Verifies presence of a store on the collection
   *
   * @param {Fluxo.Store} store - the store to verify presence
   * @returns {Fluxo.Store|undefined} - the found flux store or undefined
   */
  storeAlreadyAdded: function (store) {
    return this.find(store.data.id);
  },

  /**
   * @returns {null}
   */
  removeListenersOn: function(store) {
    this.storesOnChangeCancelers[store.changeEventToken].call();
    delete this.storesOnChangeCancelers[store.changeEventToken];
  },

  /**
   * @param {Fluxo.Store} store - the store to remove
   * @returns {null}
   */
  remove: function(store) {
    this.removeListenersOn(store);

    this.stores.splice(this.stores.indexOf(store), 1);

    this.trigger("remove", store);
    this.trigger("change");
  },

  /**
   * @returns {Object}
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
   * @returns {Object}
   */
  toJSON: function() {
    return {
      data: this.data,
      stores: this.storesToJSON()
    };
  }
});
