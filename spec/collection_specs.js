describe("Fluxo.CollectionStore", function () {
  it("parsing store's data on collection's store object", function() {
    class Collection extends Fluxo.CollectionStore {}

    class Store extends Fluxo.ObjectStore {
      customMethod () {
        return this.data.name + "foo";
      }
    }

    Collection.store = Store;

    var collection = new Collection([{ name: "Fluxo" }]);

    expect(collection.stores[0].customMethod()).to.be.eql("Fluxofoo");
  });

  it("#cid", function() {
    var collection1 = new Fluxo.CollectionStore(),
        collection2 = new Fluxo.CollectionStore();

    expect(collection1.cid).to.exist;
    expect(collection2.cid).to.exist;

    expect(collection1.cid).to.not.equal(collection2.cid);
  });

  it("#addStore", function() {
    var collection = new Fluxo.CollectionStore(),
        onChangeCallback = chai.spy();

    collection.on(["change"], onChangeCallback);

    var store = collection.addStore({ name: "Samuel" });

    expect(collection.toJSON()).to.be.eql({
      cid: collection.cid,
      stores: [{ cid: store.cid, name: "Samuel" }]
    });
    expect(onChangeCallback).to.have.been.called();
  });

  it("calls onChangeCallback when a child store changes", function() {
    var collection = new Fluxo.CollectionStore([{ name: "Samuel" }]),
        onChangeCallback = chai.spy(),
        onStoreNameChangeCallback = chai.spy();

    collection.on(["stores:change"], onChangeCallback);
    collection.on(["stores:change:name"], onStoreNameChangeCallback);

    collection.stores[0].setAttribute("name", "Samuel S");
    expect(onChangeCallback).to.have.been.called();
    expect(onStoreNameChangeCallback).to.have.been.called();
  });

  it("#remove", function() {
    var store = new Fluxo.ObjectStore({ name: "Samuel" }),
        collection = new Fluxo.CollectionStore(),
        onChangeCallback = chai.spy();

    collection.addStore(store);

    collection.remove(store);

    collection.on(["change"], onChangeCallback);

    store.setAttribute("name", "a diferent name");

    expect(collection.stores).to.be.eql([]);
    expect(onChangeCallback).to.not.have.been.called();
  });

  it("#removeAll", function() {
    var collection = new Fluxo.CollectionStore({ name: "Samuel" }, { name: "Fluxo" }),
        onChangeCallback = chai.spy();

    collection.on(["change"], onChangeCallback);

    collection.removeAll();

    expect(collection.stores).to.be.eql([]);
    expect(onChangeCallback).to.have.been.called();
  });

  it("#addStores", function() {
    var collection = new Fluxo.CollectionStore(),
        store = new Fluxo.ObjectStore(),
        onChangeCallback = chai.spy();

    collection.on(["change", "add"], onChangeCallback);

    collection.addStores([store]);

    expect(collection.stores).to.be.eql([store]);
    expect(onChangeCallback).to.have.been.called.exactly(2);
  });

  it("#where", function() {
    var store1 = new Fluxo.ObjectStore({ id: 20, name: "samuel" }),
        store2 = new Fluxo.ObjectStore({ id: 21, name: "simoes" }),
        store3 = new Fluxo.ObjectStore({ id: 22, name: "simoes" });

    var collection = new Fluxo.CollectionStore([store1, store2, store3]);

    expect(collection.where({ name: "simoes" })).to.be.eql([store2, store3]);
    expect(collection.findWhere({ name: "samuel" })).to.be.eql(store1);
  });

  it("#sort", function() {
    class Collection extends Fluxo.CollectionStore {
      sort (a, b) {
        return a.data.price - b.data.price;
      }
    }

    var store1 = new Fluxo.ObjectStore({ price: 100 }),
        store2 = new Fluxo.ObjectStore({ price: 10 }),
        store3 = new Fluxo.ObjectStore({ price: 1 });

    var collection = new Collection([store1, store2, store3]);

    expect(collection.stores).to.be.eql([store3, store2, store1]);
  });

  describe("#setStores", function () {
    it("update and add new stores", function() {
      var store1 = new Fluxo.ObjectStore({ id: 1, name: "Samuel", gender: "m" });
      var store2 = new Fluxo.ObjectStore({ id: 2, name: "Foo" });

      var collection = new Fluxo.CollectionStore([store1, store2]);

      collection.setStores([{ id: 1, name: "Simões" }, { id: 3, name: "Foo" }]);

      expect(store1.data.name).to.be.eql("Simões");
      expect(store1.data.gender).to.be.eql("m");
      expect(collection.stores).to.be.eql([store1, store2, collection.find(3)]);
    });

    it("update and remove missing stores", function() {
      var store1 = new Fluxo.ObjectStore({ id: 1, name: "Samuel", gender: "m" });
      var store2 = new Fluxo.ObjectStore({ id: 2, name: "Foo" });
      var store3 = new Fluxo.ObjectStore({ id: 3, name: "Bar" });

      var collection = new Fluxo.CollectionStore([store1, store2, store3]);

      collection.setStores([{ id: 1, name: "Simões" }, store2], { removeMissing: true });

      expect(store1.data.name).to.be.eql("Simões");
      expect(store1.data.gender).to.be.eql("m");
      expect(collection.stores).to.be.eql([store1, store2]);
    });
  });

  it("#find", function() {
    var collection = new Fluxo.CollectionStore(),
        store = collection.addStore({ id: 1 });

    expect(collection.find(store.cid)).to.equal(store);
    expect(collection.find(store.data.id)).to.equal(store);
  });

  it("children's methods delegation", function() {
    var customMethod = chai.spy();

    class Collection extends Fluxo.CollectionStore {}

    Collection.childrenDelegate = ["customMethod"];

    class Store extends Fluxo.ObjectStore {
      customMethod (...args) {
        customMethod(...args);
      }
    }

    Collection.store = Store;

    var collection = new Collection([{ id: 20 }]);

    collection.customMethod(20, "Hello", 300);

    expect(customMethod).to.have.been.called.exactly(1).with("Hello", 300);
  });

  it("warns about calling delegated method on missing child store", function () {
    class Collection extends Fluxo.CollectionStore {}

    Collection.childrenDelegate = ["customMethod"];

    class Store extends Fluxo.ObjectStore {
      customMethod () {}
    }

    expect(function () {
      (new Collection()).customMethod(20);
    }).to.throw(Error, `You tried call the delegated method "customMethod" on a missing child store.`);
  });

  describe("default values", function () {
    it("initialise with default values", function () {
      class Collection extends Fluxo.CollectionStore {}

      Collection.defaults = {
        name: "Fluxo"
      };

      var store = new Collection();

      expect(store.data).to.be.eql({ name: "Fluxo" });
    });

    it("allow to override the default values", function () {
      class Collection extends Fluxo.CollectionStore {}

      Collection.defaults = {
        name: "Redux"
      };

      var store = new Collection([], { name: "Fluxo" });

      expect(store.data).to.be.eql({ name: "Fluxo" });
    });
  });

  describe("subset", function () {
    it("subset computing", function () {
      class Collection extends Fluxo.CollectionStore {
        online () {
          return this.where({ online: true });
        }
      }

      Collection.subset = {
        online: ["stores:change:online"]
      }

      var onChangeCallback = chai.spy()

      var store1 = new Fluxo.ObjectStore({ online: true }),
          store2 = new Fluxo.ObjectStore({ online: false });

      var collection = new Collection([store1, store2]);

      collection.on(["change:online"], onChangeCallback);

      expect(collection.toJSON().online).to.be.eql([{ cid: store1.cid, online: true }]);

      var store3 = new Fluxo.ObjectStore({ online: true });

      collection.addStore(store3);

      expect(collection.toJSON().online).to.be.eql([
        { cid: store1.cid, online: true },
        { cid: store3.cid, online: true }
      ]);

      store3.setAttribute("online", false);

      expect(collection.toJSON().online).to.be.eql([{ cid: store1.cid, online: true }]);

      expect(onChangeCallback).to.have.been.called.exactly(2);
    });
  });

  it("#setAttribute", function () {
    class Collection extends Fluxo.CollectionStore {
      online () { return []; }
    }

    Collection.subset = { online: [] };

    var collection = new Collection();

    expect(function () {
      collection.setAttribute("stores", true);
    }).to.throw(Error, `You can't set a attribute with "stores" name on a collection.`);

    expect(function () {
      collection.setAttribute("online", true);
    }).to.throw(Error, `The attribute name "online" is reserved to a subset.`);

    collection.setAttribute("name", "Fluxo");

    expect(collection.data.name).to.be.eql("Fluxo");
  });

  it("release keeping the children stores unreleased", function () {
    var store = new Fluxo.ObjectStore({ name: "Fluxo" }),
        collection = new Fluxo.CollectionStore([store]),
        storeCallback = chai.spy(),
        collectionCallback = chai.spy();

    store.on(["myEvent"], storeCallback);
    collection.on(["myEvent"], collectionCallback);

    collection.release({ releaseStores: false });

    store.triggerEvent("myEvent");
    collection.triggerEvent("myEvent");

    expect(collectionCallback).to.not.have.been.called();
    expect(storeCallback).to.have.been.called.once();
    expect(collection.stores.length).to.be.eql(0);
  });

  it("release releasing children stores", function () {
    var store = new Fluxo.ObjectStore({ name: "Fluxo" }),
        collection = new Fluxo.CollectionStore([store]),
        storeCallback = chai.spy(),
        collectionCallback = chai.spy();

    store.on(["myEvent"], storeCallback);
    collection.on(["myEvent"], collectionCallback);

    collection.release({ releaseStores: true });

    store.triggerEvent("myEvent");
    collection.triggerEvent("myEvent");

    expect(collectionCallback).to.not.have.been.called();
    expect(storeCallback).to.not.have.been.called();
  });
});
