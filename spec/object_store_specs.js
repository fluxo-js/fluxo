describe("Fluxo.ObjectStore", function () {
  it("#cid", function() {
    var store1 = Fluxo.ObjectStore.create(),
        store2 = Fluxo.ObjectStore.create();

    expect(store1.cid).to.exist;
    expect(store2.cid).to.exist;

    expect(store1.cid).to.not.equal(store2.cid);
  });

  it("#setAttribute", function() {
    var store = Fluxo.ObjectStore.create(),
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
    var store = Fluxo.ObjectStore.create({ data: { name: "Samuel" } }),
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
    var store = Fluxo.ObjectStore.create({ data: { name: "Samuel" } });
    expect(store.toJSON()).to.be.eql({ cid: store.cid, name: "Samuel" });
  });

  it("computed attributes", function() {
    var store = Fluxo.ObjectStore.create({
      data: {
        first_name: "Samuel",
        last_name: "Simoes"
      },

      computed: {
        "fullName": ["change:first_name", "change:last_name"]
      },

      fullName: function() {
        return (this.data.first_name + " " + this.data.last_name);
      }
    });

    expect(store.data.fullName).to.be.eql("Samuel Simoes");

    store.setAttribute("first_name", "Neo");

    expect(store.data.fullName).to.be.eql("Neo Simoes");
  });

  it("attributes parser", function() {
    var store = Fluxo.ObjectStore.create({
      data: { count: "1" },

      attributeParsers: {
        count: function(value) {
          return parseInt(value, 10);
        }
      }
    });

    expect(store.data.count).to.be.eql(1);
  });

  it("#triggerEvent", function() {
    var store = Fluxo.ObjectStore.create(),
        callback = chai.spy(),
        wildcardCallback = chai.spy();

    store.on(["myEvent"], callback);
    store.on(["*"], wildcardCallback);

    store.triggerEvent("myEvent", "myArg");

    expect(callback).to.have.been.called.with(store, "myArg");
    expect(wildcardCallback).to.have.been.called.with("myEvent", store, "myArg");
  });
});
