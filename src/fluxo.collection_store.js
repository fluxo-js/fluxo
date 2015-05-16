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

  addFromData: function(data) {
    var store = new this.store(data);

    this.addStore(store);
  },

  addStore: function(store) {
    if (this.storeAlreadyAdded(store)) { return; }

    this.stores.push(store);

    this.storesOnChangeCancelers[store.changeEventToken] =
      store.on(["change"], this.trigger.bind(this, "change"));

    this.trigger("add", store);
    this.trigger("change");
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

  toJSON: function() {
    var collectionData = [];

    for (var i = 0, l = this.stores.length; i < l; i ++) {
      var store = this.stores[i];
      collectionData.push(store.toJSON());
    }

    return {
      data: this.data,
      stores: collectionData
    };
  }
});
