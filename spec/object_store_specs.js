describe("Fluxo.ObjectStore", function () {
  context("on an instance", function() {
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
      var MyCustomStore = Fluxo.ObjectStore.extend({
        computed: {
          "fullName": ["change:first_name", "change:last_name"]
        },

        fullName: function() {
          return (this.data.first_name + " " + this.data.last_name);
        }
      });

      var store = new MyCustomStore({ first_name: "Samuel", last_name: "Simoes" });

      expect(store.data.fullName).to.be.eql("Samuel Simoes");

      store.setAttribute("first_name", "Neo");

      expect(store.data.fullName).to.be.eql("Neo Simoes");
    });

    it("attributes parser", function() {
      var MyCustomStore = Fluxo.ObjectStore.extend({
        attributeParsers: {
          count: function(value) {
            return parseInt(value, 10);
          }
        }
      });

      var store = new MyCustomStore({ count: "1" });

      expect(store.data.count).to.be.eql(1);
    });
  });

  context("on a class", function() {
    it("#extend", function() {
      var MyCustomStore = Fluxo.ObjectStore.extend({
        myCustomMethod: function() {
          return this.data.name;
        }
      });

      var store = new MyCustomStore({ name: "Samuel" });

      expect(store.myCustomMethod()).to.be.eql("Samuel");
    });
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
});
