Fluxo.CollectionStore = function(storesData, options) {
  // Copy data to not mutate the original object
  if (storesData) {
    storesData = JSON.parse(JSON.stringify(storesData));
  } else {
    storesData = [];
  }

  this.changeEventToken = Math.random().toString().slice(2, 11);
  this.stores = [];
  this.options = options || {};

  for (var i = 0, l = storesData.length; i < l; i ++) {
    this.addFromData(storesData[i]);
  }

  Fluxo.Mixin.apply(null, [Object.getPrototypeOf(this)].concat(this.mixins));

  this.initialize(storesData, options);
};

Fluxo.CollectionStore.extend = extend;

Fluxo.CollectionStore.prototype = {
  initialize: function () {},

  mixins: [],

  store: Fluxo.Store,

  storesOnChangeCancelers: {},

  addFromData: function(data) {
    var store = new this.store(data);

    this.addStore(store);
  },

  addStore: function(store) {
    if (this.storeAlreadyAdded(store)) { return; }

    this.stores.push(store);

    this.storesOnChangeCancelers[store.changeEventToken] = store.on(["change"], this.emitChange.bind(this));

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
    this.storesOnChangeCancelers[store.changeEventToken].call();

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
