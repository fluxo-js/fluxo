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
    expect(onChangeNameCallback).to.have.been.called.with(undefined);

    store.setAttribute("name", "Foo");
    expect(store.data).to.be.eql({ name: "Foo" });
    expect(onChangeNameCallback).to.have.been.called.with("Samuel");
  });

  describe("#set", function () {
    it("define attributes", function() {
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

    it("does not emit change if nothing change", function() {
      var store = new Fluxo.ObjectStore({ name: "Samuel" }),
          onChangeCallback = chai.spy();

      store.on(["change"], onChangeCallback);

      store.set({ name: "Samuel" });

      expect(onChangeCallback).to.not.have.been.called();
    });
  })

  it("#toJSON", function() {
    var store = new Fluxo.ObjectStore({ name: "Samuel" });

    var firstJSON = store.toJSON();

    expect(firstJSON).to.be.eql({ cid: store.cid, name: "Samuel" });

    expect(store.toJSON()).to.be.equal(firstJSON);

    store.setAttribute("name", "John Doe");

    var secondJSON = store.toJSON();

    expect(secondJSON).to.be.eql({ cid: store.cid, name: "John Doe" });

    expect(secondJSON).to.be.not.equal(firstJSON);

    store.unsetAttribute("name");

    expect(store.toJSON()).to.be.eql({ cid: store.cid });
  });

  describe("computed attributes", function() {
    it("warning about change with other dependent events", function () {
      class Store extends Fluxo.ObjectStore {
        fullName () { return; }
      }

      Store.computed = {
        fullName: ["change:name", "change"]
      };

      expect(function () {
        new Store();
      }).to.throw(Error, `You can't register a COMPUTED PROPERTY (Store#fullName) with the "change" event and other events. The "change" event will be called on every change so you don't need complement with other events.`);
    });

    it("recomputes on the change event", function() {
      class Store extends Fluxo.ObjectStore {
        fullName () {
          return (this.data.first_name + " " + this.data.last_name);
        }
      }

      Store.computed = {
        fullName: ["change"]
      };

      var store = new Store({ first_name: "Samuel", last_name: "Simoes" });

      expect(store.data.fullName).to.be.eql("Samuel Simoes");

      store.setAttribute("first_name", "Neo");

      expect(store.data.fullName).to.be.eql("Neo Simoes");
    });

    it("recomputes when the specified event got triggered", function() {
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

    it("recomputes everything when reset is called", function() {
      class Store extends Fluxo.ObjectStore {
        hasEmail () {
          return this.data.emails.length > 0;
        }

        isJohn () {
          return this.data.name === "John";
        }

        isAdult () {
          return this.data.age >= 21;
        }
      }

      Store.attributes = {
        emails: { defaultValue: [] }
      };

      Store.computed = {
        isJohn: ["change:name"],
        isAdult: ["change:age"],
        hasEmail: ["change:emails"]
      };

      var store = new Store({ name: "John", age: 34, emails: ["foo@foo.com"] });

      expect(store.data.isJohn).to.be.true;
      expect(store.data.isAdult).to.be.true;
      expect(store.data.hasEmail).to.be.true;

      store.reset({ age: 34 });

      expect(store.data.isJohn).to.be.false;
      expect(store.data.isAdult).to.be.true;

      store.reset();

      expect(store.data.isJohn).to.be.false;
      expect(store.data.isAdult).to.be.false;
      expect(store.data.hasEmail).to.be.false;
    });
  });

  it("attributes parser", function() {
    class Store extends Fluxo.ObjectStore {};

    Store.attributes ={
      count: {
        parser: function (value) { return parseInt(value, 10); }
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

  describe("#reset", function () {
    it("reset attributes", function () {
      class Store extends Fluxo.ObjectStore {}

      Store.attributes = {
        type: { defaultValue: "myStore" }
      };

      let store = new Store({ name: "Fluxo" });

      expect(store.data).to.contain.all.keys("type", "name");

      store.setAttribute("type", "newType");

      store.reset({ otherKey: "foo" });

      expect(store.data).to.contain.all.keys("type", "otherKey");

      expect(store.data.type).to.be.eql("myStore");
    });

    it("does not emit change if nothing change", function() {
      var store = new Fluxo.ObjectStore({ name: "Samuel" }),
          onChangeCallback = chai.spy();

      store.on(["change"], onChangeCallback);

      store.reset({ name: "Samuel" });

      expect(onChangeCallback).to.not.have.been.called();
    });

    it("reset without attributes contract", function () {
      class Store extends Fluxo.ObjectStore {}

      let store = new Store({ fname: "John" });

      expect(store.data).to.contain.all.keys("fname");

      store.reset({ lname: "Smith" });

      expect(store.data).to.contain.all.keys("lname");
    });
  });

  describe("#clear", function () {
    it("clear attributes", function () {
      var store = new Fluxo.ObjectStore({ name: "Fluxo" });

      expect(store.data).to.contain.all.keys("name");

      store.clear();

      expect(store.data).to.not.contain.key("name");
    });

    it("does not emit change if nothing change", function() {
      var store = new Fluxo.ObjectStore(),
          onChangeCallback = chai.spy();

      store.on(["change"], onChangeCallback);

      store.clear();

      expect(onChangeCallback).to.not.have.been.called();
    });
  });

  describe("default values", function () {
    it("initialise with default values", function () {
      class Store extends Fluxo.ObjectStore {}

      Store.attributes = {
        name: { defaultValue: "Fluxo" }
      };

      var store = new Store();

      expect(store.data).to.be.eql({ name: "Fluxo" });
    });

    it("allow to override the default values", function () {
      class Store extends Fluxo.ObjectStore {}

      Store.attributes = {
        name: { defaultValue: "Redux" }
      };

      var store = new Store({ name: "Fluxo" });

      expect(store.data).to.be.eql({ name: "Fluxo" });
    });
  });

  it("custom dump generates the specified value", function () {
    class Store extends Fluxo.ObjectStore {}

    Store.attributes = {
      name: { dump: function (value) { return value[0]; } }
    };

    var store = new Store({ name: "Fluxo" });

    expect(store.toJSON()["name"]).to.be.eql("F");
  });

  describe("children events bubbling", function () {
    it("parent setup the bubbling", function () {
      let parentStore = new Fluxo.ObjectStore();
      let childStore = new Fluxo.ObjectStore();
      let setStoreCallback = chai.spy();
      let setStoreAttributeCallback = chai.spy();

      parentStore.on(["change:child", "change"], setStoreCallback);

      parentStore.setAttribute("child", childStore);

      expect(setStoreCallback).to.have.been.called.twice();

      parentStore.on(["change:child:name", "change:child", "change"], setStoreAttributeCallback);

      childStore.setAttribute("name", "Fluxo");

      expect(setStoreAttributeCallback).to.have.been.called.exactly(3);
    });

    it("parent remove the bubbling setup on change", function () {
      let parentStore = new Fluxo.ObjectStore();
      let firstChildStore = new Fluxo.ObjectStore();
      let otherChildStore = new Fluxo.ObjectStore();
      let setStoreAttributeCallback = chai.spy();

      parentStore.setAttribute("child", firstChildStore);

      parentStore.setAttribute("child", otherChildStore);

      parentStore.on(["change:child:name"], setStoreAttributeCallback);

      firstChildStore.setAttribute("name", "Fluxo");

      expect(setStoreAttributeCallback).to.not.have.been.called();
    });

    it("parent remove the bubbling setup on unset", function () {
      let parentStore = new Fluxo.ObjectStore();
      let childStore = new Fluxo.ObjectStore();
      let setStoreAttributeCallback = chai.spy();

      parentStore.setAttribute("child", childStore);

      parentStore.on(["change:child:name"], setStoreAttributeCallback);

      parentStore.unsetAttribute("child");

      childStore.setAttribute("name", "Fluxo");

      expect(setStoreAttributeCallback).to.not.have.been.called();
    });

    it("setup with different classes", function () {
      class Post extends Fluxo.ObjectStore {}

      class Author extends Fluxo.ObjectStore {}

      let post = new Post();
      let author = new Author();
      let setStoreAttributeCallback = chai.spy();

      post.on(["change:author:name"], setStoreAttributeCallback);

      post.setAttribute("author", author);

      author.setAttribute("name", "Fluxo");

      expect(setStoreAttributeCallback).to.have.been.called();
    });
  });
});
