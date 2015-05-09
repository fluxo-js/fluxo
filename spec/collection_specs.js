describe("Fluxo.CollectionStore", function () {
  context("on an instance", function() {
    it("#addFromData", function() {
      var collection = new Fluxo.CollectionStore(),
          onChangeCallback = chai.spy();

      collection.onChange(onChangeCallback);

      collection.addFromData({ name: "Samuel" });

      expect(collection.toJSON()).to.be.eql([{ name: "Samuel" }]);
      expect(onChangeCallback).to.have.been.called();
    });

    it("#addStore", function() {
      var collection = new Fluxo.CollectionStore(),
          store = new Fluxo.Store({ name: "Samuel" }),
          onChangeCallback = chai.spy();

      collection.onChange(onChangeCallback);

      collection.addStore(store);

      expect(collection.toJSON()).to.be.eql([{ name: "Samuel" }]);
      expect(onChangeCallback).to.have.been.called();
    });

    it("calls onChangeCallback when a child store changes", function() {
      var collection = new Fluxo.CollectionStore([{ name: "Samuel" }]),
          onChangeCallback = chai.spy();

      collection.onChange(onChangeCallback);

      collection.stores[0].setAttribute("name", "Samuel S");
      expect(onChangeCallback).to.have.been.called();
    });

    it("#remove", function() {
      var store = new Fluxo.Store({ name: "Samuel" }),
          collection = new Fluxo.CollectionStore(),
          onChangeCallback = chai.spy();

      collection.addStore(store);

      collection.remove(store);

      collection.onChange(onChangeCallback);

      store.setAttribute("name", "a diferent name");

      expect(collection.stores).to.be.eql([]);
      expect(onChangeCallback).to.not.have.been.called();
    });
  });
});
