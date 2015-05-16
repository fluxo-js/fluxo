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
  });
});
