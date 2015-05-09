Fluxo.CollectionStore = Fluxo.Base.extend({
 _constructor: function(storesData, options) {
    // Copy data to not mutate the original object
    if (storesData) {
      storesData = JSON.parse(JSON.stringify(storesData));
    } else {
      storesData = [];
    }

    this.stores = [];

    for (var i = 0, l = storesData.length; i < l; i ++) {
      this.addFromData(storesData[i]);
    }

    this.initialize(storesData, options);
  },

  store: Fluxo.Store,

  storesOnChangeCancelers: {},

  addFromData: function(data) {
    var store = new this.store(data);

    this.addStore(store);
  },

  addStore: function(store) {
    if (this.storeAlreadyAdded(store)) { return; }

    this.stores.push(store);

    this.storesOnChangeCancelers[store.changeEventToken] =
      store.on(["change"], this.trigger.bind(this, "change"));

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

  remove: function(store) {
    this.storesOnChangeCancelers[store.changeEventToken].call();

    delete this.storesOnChangeCancelers[store.changeEventToken];

    this.stores.splice(this.stores.indexOf(store), 1);

    this.trigger("change");
  },

  toJSON: function() {
    var collectionData = [];

    for (var i = 0, l = this.stores.length; i < l; i ++) {
      var store = this.stores[i];
      collectionData.push(store.toJSON());
    }

    return collectionData;
  }
});
