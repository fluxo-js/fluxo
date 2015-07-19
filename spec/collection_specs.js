describe("Fluxo.CollectionStore", function () {
  context("on an instance", function() {
    it("#addFromData", function() {
      var collection = new Fluxo.CollectionStore(),
          onChangeCallback = chai.spy();

      collection.on(["change"], onChangeCallback);

      collection.addFromData({ name: "Samuel" });

      expect(collection.toJSON()).to.be.eql({ data: {}, stores: [{ name: "Samuel" }]});
      expect(onChangeCallback).to.have.been.called();
    });

    it("#addStore", function() {
      var collection = new Fluxo.CollectionStore(),
          store = new Fluxo.Store({ name: "Samuel" }),
          onChangeCallback = chai.spy();

      collection.on(["change"], onChangeCallback);

      collection.addStore(store);

      expect(collection.toJSON()).to.be.eql({ data: {}, stores: [{ name: "Samuel" }]});
      expect(onChangeCallback).to.have.been.called();
    });

    it("calls onChangeCallback when a child store changes", function() {
      var collection = new Fluxo.CollectionStore([{ name: "Samuel" }]),
          onChangeCallback = chai.spy();

      collection.on(["change"], onChangeCallback);

      collection.stores[0].setAttribute("name", "Samuel S");
      expect(onChangeCallback).to.have.been.called();
    });

    it("#remove", function() {
      var store = new Fluxo.Store({ name: "Samuel" }),
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
          store = new Fluxo.Store(),
          onChangeCallback = chai.spy();

      collection.on(["change", "add"], onChangeCallback);

      collection.addStores([store]);

      expect(collection.stores).to.be.eql([store]);
      expect(onChangeCallback).to.have.been.called.exactly(2);
    });

    it("#where", function() {
      var collection = new Fluxo.CollectionStore();

      var store1 = new Fluxo.Store({ id: 20, name: "samuel" }),
          store2 = new Fluxo.Store({ id: 21, name: "simoes" }),
          store3 = new Fluxo.Store({ id: 22, name: "simoes" });

      collection.addStores([store1, store2, store3]);

      expect(collection.where({ name: "simoes" })).to.be.eql([store2, store3]);
      expect(collection.findWhere({ name: "samuel" })).to.be.eql(store1);
    });

    it("#sort", function() {
      var collection = new Fluxo.CollectionStore();

      collection.sort = function(a, b) {
        return a.data.price - b.data.price;
      };

      var store1 = new Fluxo.Store({ price: 100 }),
          store2 = new Fluxo.Store({ price: 10 }),
          store3 = new Fluxo.Store({ price: 1 });

      collection.addStores([store1, store2, store3]);

      expect(collection.stores).to.be.eql([store3, store2, store1]);
    });

    it("#setFromData", function() {
      var collection = new Fluxo.CollectionStore();

      var store1 = new Fluxo.Store({ id: 1, name: "Samuel" });

      collection.addStore(store1);

      collection.setFromData([{ id: 1, name: "Simões" }, { id: 2, name: "Foo" }]);

      expect(store1.data.name).to.be.eql("Simões");
      expect(collection.stores).to.be.eql([store1, collection.find(2)]);
    });
  });
});
