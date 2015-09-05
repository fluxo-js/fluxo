describe("Fluxo.CollectionStore", function () {
  context("on an instance", function() {
    it("#cid", function() {
      var collection1 = Fluxo.CollectionStore.create(),
          collection2 = Fluxo.CollectionStore.create();

      expect(collection1.cid).to.exist;
      expect(collection2.cid).to.exist;

      expect(collection1.cid).to.not.equal(collection2.cid);
    });

    it("#addStore", function() {
      var collection = Fluxo.CollectionStore.create(),
          onChangeCallback = chai.spy();

      collection.on(["change"], onChangeCallback);


      var store = collection.addStore({ name: "Samuel" });

      expect(collection.toJSON()).to.be.eql({
        data: { cid: collection.cid },
        stores: [{ cid: store.cid, name: "Samuel" }]
      });
      expect(onChangeCallback).to.have.been.called();
    });

    it("calls onChangeCallback when a child store changes", function() {
      var collection = Fluxo.CollectionStore.create({ stores: [{ name: "Samuel" }] }),
          onChangeCallback = chai.spy(),
          onStoreNameChangeCallback = chai.spy();

      collection.on(["stores:change"], onChangeCallback);
      collection.on(["stores:change:name"], onStoreNameChangeCallback);

      collection.stores[0].setAttribute("name", "Samuel S");
      expect(onChangeCallback).to.have.been.called();
      expect(onStoreNameChangeCallback).to.have.been.called();
    });

    it("#remove", function() {
      var store = Fluxo.ObjectStore.create({ data: { name: "Samuel" } }),
          collection = Fluxo.CollectionStore.create(),
          onChangeCallback = chai.spy();

      collection.addStore(store);

      collection.remove(store);

      collection.on(["change"], onChangeCallback);

      store.setAttribute("name", "a diferent name");

      expect(collection.stores).to.be.eql([]);
      expect(onChangeCallback).to.not.have.been.called();
    });

    it("#removeAll", function() {
      var collection = Fluxo.CollectionStore.create({ stores: [{ name: "Samuel" }, { name: "Fluxo" }] }),
          onChangeCallback = chai.spy();

      collection.on(["change"], onChangeCallback);

      collection.removeAll();

      expect(collection.stores).to.be.eql([]);
      expect(onChangeCallback).to.have.been.called();
    });

    it("#addStores", function() {
      var collection = Fluxo.CollectionStore.create(),
          store = Fluxo.ObjectStore.create(),
          onChangeCallback = chai.spy();

      collection.on(["change", "add"], onChangeCallback);

      collection.addStores([store]);

      expect(collection.stores).to.be.eql([store]);
      expect(onChangeCallback).to.have.been.called.exactly(2);
    });

    it("#where", function() {
      var collection = Fluxo.CollectionStore.create();

      var store1 = Fluxo.ObjectStore.create({ data: { id: 20, name: "samuel" } }),
          store2 = Fluxo.ObjectStore.create({ data: { id: 21, name: "simoes" } }),
          store3 = Fluxo.ObjectStore.create({ data: { id: 22, name: "simoes" } });

      collection.addStores([store1, store2, store3]);

      expect(collection.where({ name: "simoes" })).to.be.eql([store2, store3]);
      expect(collection.findWhere({ name: "samuel" })).to.be.eql(store1);
    });

    it("#sort", function() {
      var collection = Fluxo.CollectionStore.create();

      collection.sort = function(a, b) {
        return a.data.price - b.data.price;
      };

      var store1 = Fluxo.ObjectStore.create({ data: { price: 100 } }),
          store2 = Fluxo.ObjectStore.create({ data: { price: 10 } }),
          store3 = Fluxo.ObjectStore.create({ data: { price: 1 } });

      collection.addStores([store1, store2, store3]);

      expect(collection.stores).to.be.eql([store3, store2, store1]);
    });

    it("#setStores", function() {
      var collection = Fluxo.CollectionStore.create();

      var store1 = Fluxo.ObjectStore.create({ data: { id: 1, name: "Samuel" } });

      collection.addStore(store1);

      collection.setStores([{ id: 1, name: "Simões" }, { id: 2, name: "Foo" }]);

      expect(store1.data.name).to.be.eql("Simões");
      expect(collection.stores).to.be.eql([store1, collection.find(2)]);
    });

    it("#find", function() {
      var collection = Fluxo.CollectionStore.create(),
          store = collection.addStore({ id: 1 });

      expect(collection.find(store.cid)).to.equal(store);
      expect(collection.find(store.data.id)).to.equal(store);
    });
  });
});
