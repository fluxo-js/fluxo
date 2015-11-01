describe("Fluxo.ObjectStore", function () {
  it("#cid", function() {
    var store1 = new Fluxo.ObjectStore(),
        store2 = new Fluxo.ObjectStore();

    expect(store1.cid).to.exist;
    expect(store2.cid).to.exist;

    expect(store1.cid).to.not.equal(store2.cid);
  });

  it("#setAttribute", function() {
    var store = new Fluxo.ObjectStore(),
        onChangeCallback = chai.spy(),
        onChangeNameCallback = chai.spy();

    store.on(["change"], onChangeCallback);
    store.on(["change:name"], onChangeNameCallback);

    store.setAttribute("name", "Samuel");

    expect(store.data).to.be.eql({ name: "Samuel" });
    expect(onChangeCallback).to.have.been.called();
    expect(onChangeNameCallback).to.have.been.called();
  });

  it("#set", function() {
    var store = new Fluxo.ObjectStore({ name: "Samuel" }),
        onChangeCallback = chai.spy(),
        onChangeNameCallback = chai.spy();

    expect(store.data).to.be.eql({ name: "Samuel" });

    store.on(["change"], onChangeCallback);
    store.on(["change:name"], onChangeNameCallback);

    store.set({ name: "Other", email: "fluxo@flux.com" });

    expect(store.data).to.be.eql({ name: "Other", email: "fluxo@flux.com" });
    expect(onChangeCallback).to.have.been.called();
    expect(onChangeNameCallback).to.have.been.called();
  });

  it("#toJSON", function() {
    var store = new Fluxo.ObjectStore({ name: "Samuel" });
    expect(store.toJSON()).to.be.eql({ cid: store.cid, name: "Samuel" });
  });

  it("computed attributes", function() {
    class Store extends Fluxo.ObjectStore {
      fullName () {
        return (this.data.first_name + " " + this.data.last_name);
      }
    }

    Store.computed = {
      fullName: ["change:first_name", "change:last_name"]
    };

    var store = new Store({ first_name: "Samuel", last_name: "Simoes" });

    expect(store.data.fullName).to.be.eql("Samuel Simoes");

    store.setAttribute("first_name", "Neo");

    expect(store.data.fullName).to.be.eql("Neo Simoes");
  });

  it("attributes parser", function() {
    class Store extends Fluxo.ObjectStore {};

    Store.attributeParsers ={
      count: function(value) {
        return parseInt(value, 10);
      }
    };

    var store = new Store({ count: "1" });

    expect(store.data.count).to.be.eql(1);
  });

  it("#triggerEvent", function() {
    var store = new Fluxo.ObjectStore(),
        callback = chai.spy(),
        wildcardCallback = chai.spy();

    store.on(["myEvent"], callback);
    store.on(["*"], wildcardCallback);

    store.triggerEvent("myEvent", "myArg");

    expect(callback).to.have.been.called.with(store, "myArg");
    expect(wildcardCallback).to.have.been.called.with("myEvent", store, "myArg");
  });

  it("unset", function () {
    var store = new Fluxo.ObjectStore({ name: "Fluxo" });

    expect(store.data).to.contain.all.keys({ name: "Fluxo" });

    store.unsetAttribute("name");

    expect(store.data).to.not.contain.key("name");
  });

  it("reset", function () {
    var store = new Fluxo.ObjectStore({ name: "Fluxo" });

    expect(store.data).to.contain.all.keys({ name: "Fluxo" });

    store.reset({ type: "Object" });

    expect(store.data).to.contain.all.keys({ type: "Object" });
    expect(store.data).to.not.contain.key("name");
  });

  describe("default values", function () {
    it("initialise with default values", function () {
      class Store extends Fluxo.ObjectStore {}

      Store.defaults = {
        name: "Fluxo"
      };

      var store = new Store();

      expect(store.data).to.be.eql({ name: "Fluxo" });
    });

    it("allow to override the default values", function () {
      class Store extends Fluxo.ObjectStore {}

      Store.defaults = {
        name: "Redux"
      };

      var store = new Store({ name: "Fluxo" });

      expect(store.data).to.be.eql({ name: "Fluxo" });
    });
  });
});
