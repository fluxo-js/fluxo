describe("Fluxo.CollectionStore", function () {
  context("on an instance", function() {
    it("#cid", function() {
      var collection1 = new Fluxo.CollectionStore(),
          collection2 = new Fluxo.CollectionStore();

      expect(collection1.cid).to.exist;
      expect(collection2.cid).to.exist;

      expect(collection1.cid).to.not.equal(collection2.cid);
    });

    it("#addFromData", function() {
      var collection = new Fluxo.CollectionStore(),
          onChangeCallback = chai.spy();

      collection.on(["change"], onChangeCallback);

      var store = collection.addFromData({ name: "Samuel" });

      expect(collection.toJSON()).to.be.eql({ data: { cid: collection.cid }, stores: [{ cid: store.cid, name: "Samuel" }]});
      expect(onChangeCallback).to.have.been.called();
    });

    it("#addStore", function() {
      var collection = new Fluxo.CollectionStore(),
          store = new Fluxo.ObjectStore({ name: "Samuel" }),
          onChangeCallback = chai.spy();

      collection.on(["change"], onChangeCallback);

      collection.addStore(store);

      expect(collection.toJSON()).to.be.eql({ data: { cid: collection.cid }, stores: [{ cid: store.cid, name: "Samuel" }]});
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
      var collection = new Fluxo.CollectionStore([{ name: "Samuel" }, { name: "Fluxo" }]),
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
      var collection = new Fluxo.CollectionStore();

      var store1 = new Fluxo.ObjectStore({ id: 20, name: "samuel" }),
          store2 = new Fluxo.ObjectStore({ id: 21, name: "simoes" }),
          store3 = new Fluxo.ObjectStore({ id: 22, name: "simoes" });

      collection.addStores([store1, store2, store3]);

      expect(collection.where({ name: "simoes" })).to.be.eql([store2, store3]);
      expect(collection.findWhere({ name: "samuel" })).to.be.eql(store1);
    });

    it("#sort", function() {
      var collection = new Fluxo.CollectionStore();

      collection.sort = function(a, b) {
        return a.data.price - b.data.price;
      };

      var store1 = new Fluxo.ObjectStore({ price: 100 }),
          store2 = new Fluxo.ObjectStore({ price: 10 }),
          store3 = new Fluxo.ObjectStore({ price: 1 });

      collection.addStores([store1, store2, store3]);

      expect(collection.stores).to.be.eql([store3, store2, store1]);
    });

    it("#setFromData", function() {
      var collection = new Fluxo.CollectionStore();

      var store1 = new Fluxo.ObjectStore({ id: 1, name: "Samuel" });

      collection.addStore(store1);

      collection.setFromData([{ id: 1, name: "Simões" }, { id: 2, name: "Foo" }]);

      expect(store1.data.name).to.be.eql("Simões");
      expect(collection.stores).to.be.eql([store1, collection.find(2)]);
    });

    it("#find", function() {
      var collection = new Fluxo.CollectionStore(),
          store = collection.addFromData({ id: 1 });

      expect(collection.find(store.cid)).to.equal(store);
      expect(collection.find(store.data.id)).to.equal(store);
    });
  });
});
