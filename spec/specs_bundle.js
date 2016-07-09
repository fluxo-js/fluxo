(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

describe("Fluxo.CollectionStore", function () {
  it("allows quick dumb collections", function () {
    var Store = (function (_Fluxo$ObjectStore) {
      _inherits(Store, _Fluxo$ObjectStore);

      function Store() {
        _classCallCheck(this, Store);

        _get(Object.getPrototypeOf(Store.prototype), "constructor", this).apply(this, arguments);
      }

      return Store;
    })(Fluxo.ObjectStore);

    var collection = new Fluxo.CollectionStore([{ id: 1 }], {}, { store: Store });

    expect(collection.stores[0]).to.be["instanceof"](Store);
  });

  it("parsing store's data on collection's store object", function () {
    var Collection = (function (_Fluxo$CollectionStore) {
      _inherits(Collection, _Fluxo$CollectionStore);

      function Collection() {
        _classCallCheck(this, Collection);

        _get(Object.getPrototypeOf(Collection.prototype), "constructor", this).apply(this, arguments);
      }

      return Collection;
    })(Fluxo.CollectionStore);

    var Store = (function (_Fluxo$ObjectStore2) {
      _inherits(Store, _Fluxo$ObjectStore2);

      function Store() {
        _classCallCheck(this, Store);

        _get(Object.getPrototypeOf(Store.prototype), "constructor", this).apply(this, arguments);
      }

      _createClass(Store, [{
        key: "customMethod",
        value: function customMethod() {
          return this.data.name + "foo";
        }
      }]);

      return Store;
    })(Fluxo.ObjectStore);

    Collection.store = Store;

    var collection = new Collection([{ name: "Fluxo" }]);

    expect(collection.stores[0].customMethod()).to.be.eql("Fluxofoo");
  });

  it("#cid", function () {
    var collection1 = new Fluxo.CollectionStore(),
        collection2 = new Fluxo.CollectionStore();

    expect(collection1.cid).to.exist;
    expect(collection2.cid).to.exist;

    expect(collection1.cid).to.not.equal(collection2.cid);
  });

  describe("#addStore", function () {
    it("add a store", function () {
      var collection = new Fluxo.CollectionStore(),
          onChangeCallback = chai.spy();

      collection.on(["change"], onChangeCallback);

      var store = collection.addStore({ name: "Samuel" });

      expect(collection.toJSON()).to.be.eql({
        cid: collection.cid,
        stores: [{ cid: store.cid, name: "Samuel" }]
      });
      expect(onChangeCallback).to.have.been.called.once();
    });

    it("can add a store in a specific index", function () {
      var collection = new Fluxo.CollectionStore([{ id: 3 }, { id: 1 }]);

      collection.addStore({ id: 2 }, { atIndex: 1 });

      expect(collection.stores.map(function (store) {
        return store.data.id;
      })).to.be.eql([3, 2, 1]);
    });
  });

  it("calls onChangeCallback when a child store changes", function () {
    var collection = new Fluxo.CollectionStore([{ name: "Samuel" }]),
        onChangeCallback = chai.spy(),
        onStoreNameChangeCallback = chai.spy();

    collection.on(["change", "stores:change"], onChangeCallback);
    collection.on(["stores:change:name"], onStoreNameChangeCallback);

    collection.stores[0].setAttribute("name", "Samuel S");
    expect(onChangeCallback).to.have.been.called().exactly(2);
    expect(onStoreNameChangeCallback).to.have.been.called.once();
  });

  it("#remove", function () {
    var store = new Fluxo.ObjectStore({ name: "Samuel" }),
        collection = new Fluxo.CollectionStore(),
        onChangeCallback = chai.spy();

    collection.addStore(store);

    collection.remove(store);

    collection.on(["change"], onChangeCallback);

    store.setAttribute("name", "a diferent name");

    expect(collection.stores).to.be.eql([]);
    expect(onChangeCallback).to.not.have.been.called.exactly(3);
  });

  it("#removeAll", function () {
    var collection = new Fluxo.CollectionStore({ name: "Samuel" }, { name: "Fluxo" }),
        onChangeCallback = chai.spy();

    collection.on(["change"], onChangeCallback);

    collection.removeAll();

    expect(collection.stores).to.be.eql([]);
    expect(onChangeCallback).to.have.been.called();
  });

  it("#addStores", function () {
    var collection = new Fluxo.CollectionStore(),
        store = new Fluxo.ObjectStore(),
        onChangeCallback = chai.spy();

    collection.on(["change", "add"], onChangeCallback);

    collection.addStores([store]);

    expect(collection.stores).to.be.eql([store]);
    expect(onChangeCallback).to.have.been.called.exactly(2);
  });

  it("#where", function () {
    var store1 = new Fluxo.ObjectStore({ id: 20, name: "samuel" }),
        store2 = new Fluxo.ObjectStore({ id: 21, name: "simoes" }),
        store3 = new Fluxo.ObjectStore({ id: 22, name: "simoes" });

    var collection = new Fluxo.CollectionStore([store1, store2, store3]);

    expect(collection.where({ name: "simoes" })).to.be.eql([store2, store3]);
    expect(collection.findWhere({ name: "samuel" })).to.be.eql(store1);
  });

  it("#sort", function () {
    var Collection = (function (_Fluxo$CollectionStore2) {
      _inherits(Collection, _Fluxo$CollectionStore2);

      function Collection() {
        _classCallCheck(this, Collection);

        _get(Object.getPrototypeOf(Collection.prototype), "constructor", this).apply(this, arguments);
      }

      _createClass(Collection, [{
        key: "sort",
        value: function sort(a, b) {
          return a.data.price - b.data.price;
        }
      }]);

      return Collection;
    })(Fluxo.CollectionStore);

    var store1 = new Fluxo.ObjectStore({ price: 100 }),
        store2 = new Fluxo.ObjectStore({ price: 10 }),
        store3 = new Fluxo.ObjectStore({ price: 1 });

    var collection = new Collection([store1, store2, store3]);

    expect(collection.stores).to.be.eql([store3, store2, store1]);

    store3.setAttribute("price", 200);

    expect(collection.stores).to.be.eql([store2, store1, store3]);

    collection.remove(store1);

    expect(collection.stores).to.be.eql([store2, store3]);
  });

  describe("#setStores", function () {
    it("update and add new stores", function () {
      var store1 = new Fluxo.ObjectStore({ id: 1, name: "Samuel", gender: "m" });
      var store2 = new Fluxo.ObjectStore({ id: 2, name: "Foo" });

      var collection = new Fluxo.CollectionStore([store1, store2]);

      collection.setStores([{ id: 1, name: "Simões" }, { id: 3, name: "Foo" }]);

      expect(store1.data.name).to.be.eql("Simões");
      expect(store1.data.gender).to.be.eql("m");
      expect(collection.stores).to.be.eql([store1, store2, collection.find(3)]);
    });

    it("update and remove missing stores", function () {
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

  it("#find", function () {
    var collection = new Fluxo.CollectionStore(),
        store = collection.addStore({ id: 1 });

    expect(collection.find(store.cid)).to.equal(store);
    expect(collection.find(store.data.id)).to.equal(store);
  });

  it("children's methods delegation", function () {
    var _customMethod = chai.spy();

    var Collection = (function (_Fluxo$CollectionStore3) {
      _inherits(Collection, _Fluxo$CollectionStore3);

      function Collection() {
        _classCallCheck(this, Collection);

        _get(Object.getPrototypeOf(Collection.prototype), "constructor", this).apply(this, arguments);
      }

      return Collection;
    })(Fluxo.CollectionStore);

    Collection.childrenDelegate = ["customMethod"];

    var Store = (function (_Fluxo$ObjectStore3) {
      _inherits(Store, _Fluxo$ObjectStore3);

      function Store() {
        _classCallCheck(this, Store);

        _get(Object.getPrototypeOf(Store.prototype), "constructor", this).apply(this, arguments);
      }

      _createClass(Store, [{
        key: "customMethod",
        value: function customMethod() {
          _customMethod.apply(undefined, arguments);
        }
      }]);

      return Store;
    })(Fluxo.ObjectStore);

    Collection.store = Store;

    var collection = new Collection([{ id: 20 }]);

    collection.customMethod(20, "Hello", 300);

    expect(_customMethod).to.have.been.called.exactly(1)["with"]("Hello", 300);
  });

  it("warns about calling delegated method on missing child store", function () {
    var Collection = (function (_Fluxo$CollectionStore4) {
      _inherits(Collection, _Fluxo$CollectionStore4);

      function Collection() {
        _classCallCheck(this, Collection);

        _get(Object.getPrototypeOf(Collection.prototype), "constructor", this).apply(this, arguments);
      }

      return Collection;
    })(Fluxo.CollectionStore);

    Collection.childrenDelegate = ["customMethod"];

    var Store = (function (_Fluxo$ObjectStore4) {
      _inherits(Store, _Fluxo$ObjectStore4);

      function Store() {
        _classCallCheck(this, Store);

        _get(Object.getPrototypeOf(Store.prototype), "constructor", this).apply(this, arguments);
      }

      _createClass(Store, [{
        key: "customMethod",
        value: function customMethod() {}
      }]);

      return Store;
    })(Fluxo.ObjectStore);

    expect(function () {
      new Collection().customMethod(20);
    }).to["throw"](Error, "You tried call the delegated method \"customMethod\" on a missing child store.");
  });

  describe("default values", function () {
    it("initialise with default values", function () {
      var Collection = (function (_Fluxo$CollectionStore5) {
        _inherits(Collection, _Fluxo$CollectionStore5);

        function Collection() {
          _classCallCheck(this, Collection);

          _get(Object.getPrototypeOf(Collection.prototype), "constructor", this).apply(this, arguments);
        }

        return Collection;
      })(Fluxo.CollectionStore);

      Collection.attributes = {
        name: { defaultValue: "Fluxo" }
      };

      var store = new Collection();

      expect(store.data).to.be.eql({ name: "Fluxo" });
    });

    it("allow to override the default values", function () {
      var Collection = (function (_Fluxo$CollectionStore6) {
        _inherits(Collection, _Fluxo$CollectionStore6);

        function Collection() {
          _classCallCheck(this, Collection);

          _get(Object.getPrototypeOf(Collection.prototype), "constructor", this).apply(this, arguments);
        }

        return Collection;
      })(Fluxo.CollectionStore);

      Collection.defaults = {
        name: "Redux"
      };

      var store = new Collection([], { name: "Fluxo" });

      expect(store.data).to.be.eql({ name: "Fluxo" });
    });
  });

  describe("subset", function () {
    it("warning about change with other dependent events", function () {
      var Collection = (function (_Fluxo$CollectionStore7) {
        _inherits(Collection, _Fluxo$CollectionStore7);

        function Collection() {
          _classCallCheck(this, Collection);

          _get(Object.getPrototypeOf(Collection.prototype), "constructor", this).apply(this, arguments);
        }

        _createClass(Collection, [{
          key: "online",
          value: function online() {
            return [];
          }
        }]);

        return Collection;
      })(Fluxo.CollectionStore);

      Collection.subset = {
        online: ["add", "remove", "change"]
      };

      expect(function () {
        new Collection();
      }).to["throw"](Error, "You can't register a SUBSET (Collection#online) with the \"change\" event and other events. The \"change\" event will be called on every change so you don't need complement with other events.");
    });

    it("subset computing", function () {
      var Collection = (function (_Fluxo$CollectionStore8) {
        _inherits(Collection, _Fluxo$CollectionStore8);

        function Collection() {
          _classCallCheck(this, Collection);

          _get(Object.getPrototypeOf(Collection.prototype), "constructor", this).apply(this, arguments);
        }

        _createClass(Collection, [{
          key: "online",
          value: function online() {
            return this.where({ online: true });
          }
        }]);

        return Collection;
      })(Fluxo.CollectionStore);

      Collection.subset = {
        online: ["add", "remove", "stores:change:online"]
      };

      var onChangeCallback = chai.spy();

      var store1 = new Fluxo.ObjectStore({ online: true }),
          store2 = new Fluxo.ObjectStore({ online: false });

      var collection = new Collection([store1, store2]);

      collection.on(["change:online"], onChangeCallback);

      expect(collection.toJSON().online).to.be.eql([{ cid: store1.cid, online: true }]);

      var store3 = new Fluxo.ObjectStore({ online: true });

      collection.addStore(store3);

      expect(collection.toJSON().online).to.be.eql([{ cid: store1.cid, online: true }, { cid: store3.cid, online: true }]);

      store3.setAttribute("online", false);

      expect(collection.toJSON().online).to.be.eql([{ cid: store1.cid, online: true }]);

      expect(onChangeCallback).to.have.been.called.exactly(2);
    });

    it("alert about computer function returning something different of an array", function () {
      var Collection = (function (_Fluxo$CollectionStore9) {
        _inherits(Collection, _Fluxo$CollectionStore9);

        function Collection() {
          _classCallCheck(this, Collection);

          _get(Object.getPrototypeOf(Collection.prototype), "constructor", this).apply(this, arguments);
        }

        _createClass(Collection, [{
          key: "online",
          value: function online() {
            return;
          }
        }]);

        return Collection;
      })(Fluxo.CollectionStore);

      Collection.subset = {
        online: ["stores:change:online"]
      };

      expect(function () {
        new Collection();
      }).to["throw"](Error, "The subset \"online\" computer function returned a value that isn't an array.");
    });
  });

  it("#setAttribute", function () {
    var Collection = (function (_Fluxo$CollectionStore10) {
      _inherits(Collection, _Fluxo$CollectionStore10);

      function Collection() {
        _classCallCheck(this, Collection);

        _get(Object.getPrototypeOf(Collection.prototype), "constructor", this).apply(this, arguments);
      }

      _createClass(Collection, [{
        key: "online",
        value: function online() {
          return [];
        }
      }]);

      return Collection;
    })(Fluxo.CollectionStore);

    Collection.subset = { online: [] };

    var collection = new Collection();

    expect(function () {
      collection.setAttribute("stores", true);
    }).to["throw"](Error, "You can't set a attribute with \"stores\" name on a collection.");

    expect(function () {
      collection.setAttribute("online", true);
    }).to["throw"](Error, "The attribute name \"online\" is reserved to a subset.");

    collection.setAttribute("name", "Fluxo");

    expect(collection.data.name).to.be.eql("Fluxo");
  });

  describe("#index", function () {
    it("keep the correct index", function () {
      var store1 = new Fluxo.ObjectStore({ id: 10, name: "Foo" });

      var collection = new Fluxo.CollectionStore([store1]);

      expect(collection.index[10]).to.be.eql(store1);
      expect(collection.index[store1.cid]).to.be.eql(store1);

      store1.setAttribute("id", 30);

      expect(collection.index[10]).to.be.eql(undefined);
      expect(collection.index[30]).to.be.eql(store1);
      expect(collection.index[store1.cid]).to.be.eql(store1);

      collection.remove(store1);

      expect(collection.index[30]).to.be.eql(undefined);
      expect(collection.index[store1.cid]).to.be.eql(undefined);
    });
  });
});

},{}],2:[function(require,module,exports){
"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

describe("Fluxo.ObjectStore", function () {
  it("#cid", function () {
    var store1 = new Fluxo.ObjectStore(),
        store2 = new Fluxo.ObjectStore();

    expect(store1.cid).to.exist;
    expect(store2.cid).to.exist;

    expect(store1.cid).to.not.equal(store2.cid);
  });

  it("#setAttribute", function () {
    var store = new Fluxo.ObjectStore(),
        onChangeCallback = chai.spy(),
        onChangeNameCallback = chai.spy();

    store.on(["change"], onChangeCallback);
    store.on(["change:name"], onChangeNameCallback);

    store.setAttribute("name", "Samuel");

    expect(store.data).to.be.eql({ name: "Samuel" });
    expect(onChangeCallback).to.have.been.called();
    expect(onChangeNameCallback).to.have.been.called["with"](undefined);

    store.setAttribute("name", "Foo");
    expect(store.data).to.be.eql({ name: "Foo" });
    expect(onChangeNameCallback).to.have.been.called["with"]("Samuel");
  });

  it("#set", function () {
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

  it("#toJSON", function () {
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

  describe("computed attributes", function () {
    it("warning about change with other dependent events", function () {
      var Store = (function (_Fluxo$ObjectStore) {
        _inherits(Store, _Fluxo$ObjectStore);

        function Store() {
          _classCallCheck(this, Store);

          _get(Object.getPrototypeOf(Store.prototype), "constructor", this).apply(this, arguments);
        }

        _createClass(Store, [{
          key: "fullName",
          value: function fullName() {
            return;
          }
        }]);

        return Store;
      })(Fluxo.ObjectStore);

      Store.computed = {
        fullName: ["change:name", "change"]
      };

      expect(function () {
        new Store();
      }).to["throw"](Error, "You can't register a COMPUTED PROPERTY (Store#fullName) with the \"change\" event and other events. The \"change\" event will be called on every change so you don't need complement with other events.");
    });

    it("recomputes on the change event", function () {
      var Store = (function (_Fluxo$ObjectStore2) {
        _inherits(Store, _Fluxo$ObjectStore2);

        function Store() {
          _classCallCheck(this, Store);

          _get(Object.getPrototypeOf(Store.prototype), "constructor", this).apply(this, arguments);
        }

        _createClass(Store, [{
          key: "fullName",
          value: function fullName() {
            return this.data.first_name + " " + this.data.last_name;
          }
        }]);

        return Store;
      })(Fluxo.ObjectStore);

      Store.computed = {
        fullName: ["change"]
      };

      var store = new Store({ first_name: "Samuel", last_name: "Simoes" });

      expect(store.data.fullName).to.be.eql("Samuel Simoes");

      store.setAttribute("first_name", "Neo");

      expect(store.data.fullName).to.be.eql("Neo Simoes");
    });

    it("recomputes when the specified event got triggered", function () {
      var Store = (function (_Fluxo$ObjectStore3) {
        _inherits(Store, _Fluxo$ObjectStore3);

        function Store() {
          _classCallCheck(this, Store);

          _get(Object.getPrototypeOf(Store.prototype), "constructor", this).apply(this, arguments);
        }

        _createClass(Store, [{
          key: "fullName",
          value: function fullName() {
            return this.data.first_name + " " + this.data.last_name;
          }
        }]);

        return Store;
      })(Fluxo.ObjectStore);

      Store.computed = {
        fullName: ["change:first_name", "change:last_name"]
      };

      var store = new Store({ first_name: "Samuel", last_name: "Simoes" });

      expect(store.data.fullName).to.be.eql("Samuel Simoes");

      store.setAttribute("first_name", "Neo");

      expect(store.data.fullName).to.be.eql("Neo Simoes");
    });

    it("recomputes everything when reset is called", function () {
      var Store = (function (_Fluxo$ObjectStore4) {
        _inherits(Store, _Fluxo$ObjectStore4);

        function Store() {
          _classCallCheck(this, Store);

          _get(Object.getPrototypeOf(Store.prototype), "constructor", this).apply(this, arguments);
        }

        _createClass(Store, [{
          key: "hasEmail",
          value: function hasEmail() {
            return this.data.emails.length > 0;
          }
        }, {
          key: "isJohn",
          value: function isJohn() {
            return this.data.name === "John";
          }
        }, {
          key: "isAdult",
          value: function isAdult() {
            return this.data.age >= 21;
          }
        }]);

        return Store;
      })(Fluxo.ObjectStore);

      Store.attributes = {
        emails: { defaultValue: [] }
      };

      Store.computed = {
        isJohn: ["change:name"],
        isAdult: ["change:age"],
        hasEmail: ["change:emails"]
      };

      var store = new Store({ name: "John", age: 34, emails: ["foo@foo.com"] });

      expect(store.data.isJohn).to.be["true"];
      expect(store.data.isAdult).to.be["true"];
      expect(store.data.hasEmail).to.be["true"];

      store.reset({ age: 34 });

      expect(store.data.isJohn).to.be["false"];
      expect(store.data.isAdult).to.be["true"];

      store.reset();

      expect(store.data.isJohn).to.be["false"];
      expect(store.data.isAdult).to.be["false"];
      expect(store.data.hasEmail).to.be["false"];
    });
  });

  describe("Attributes Parser", function () {
    it("parse before set", function () {
      var Store = (function (_Fluxo$ObjectStore5) {
        _inherits(Store, _Fluxo$ObjectStore5);

        function Store() {
          _classCallCheck(this, Store);

          _get(Object.getPrototypeOf(Store.prototype), "constructor", this).apply(this, arguments);
        }

        return Store;
      })(Fluxo.ObjectStore);

      ;

      Store.attributes = {
        count: {
          parser: function parser(value) {
            return parseInt(value, 10);
          }
        }
      };

      var store = new Store({ count: "1" });

      expect(store.data.count).to.be.eql(1);
    });

    it("parse before check if it change", function () {
      var onChangeCountCallback = chai.spy();

      var Store = (function (_Fluxo$ObjectStore6) {
        _inherits(Store, _Fluxo$ObjectStore6);

        function Store() {
          _classCallCheck(this, Store);

          _get(Object.getPrototypeOf(Store.prototype), "constructor", this).apply(this, arguments);
        }

        return Store;
      })(Fluxo.ObjectStore);

      ;

      Store.attributes = {
        count: {
          parser: function parser(value) {
            return parseInt(value, 10);
          }
        }
      };

      var store = new Store();

      store.on(["change:count"], onChangeCountCallback);

      store.setAttribute("count", "1");

      store.setAttribute("count", "1");

      expect(onChangeCountCallback).to.have.been.called.once();
    });
  });

  it("#triggerEvent", function () {
    var store = new Fluxo.ObjectStore(),
        callback = chai.spy(),
        wildcardCallback = chai.spy();

    store.on(["myEvent"], callback);
    store.on(["*"], wildcardCallback);

    store.triggerEvent("myEvent", "myArg");

    expect(callback).to.have.been.called["with"](store, "myArg");
    expect(wildcardCallback).to.have.been.called["with"]("myEvent", store, "myArg");
  });

  it("unset", function () {
    var store = new Fluxo.ObjectStore({ name: "Fluxo" });

    expect(store.data).to.contain.all.keys({ name: "Fluxo" });

    store.unsetAttribute("name");

    expect(store.data).to.not.contain.key("name");
  });

  it("reset", function () {
    var Store = (function (_Fluxo$ObjectStore7) {
      _inherits(Store, _Fluxo$ObjectStore7);

      function Store() {
        _classCallCheck(this, Store);

        _get(Object.getPrototypeOf(Store.prototype), "constructor", this).apply(this, arguments);
      }

      return Store;
    })(Fluxo.ObjectStore);

    Store.attributes = {
      type: { defaultValue: "myStore" }
    };

    var store = new Store({ name: "Fluxo" });

    expect(store.data).to.contain.all.keys("type", "name");

    store.setAttribute("type", "newType");

    store.reset({ otherKey: "foo" });

    expect(store.data).to.contain.all.keys("type", "otherKey");

    expect(store.data.type).to.be.eql("myStore");
  });

  it("reset without attributes contract", function () {
    var Store = (function (_Fluxo$ObjectStore8) {
      _inherits(Store, _Fluxo$ObjectStore8);

      function Store() {
        _classCallCheck(this, Store);

        _get(Object.getPrototypeOf(Store.prototype), "constructor", this).apply(this, arguments);
      }

      return Store;
    })(Fluxo.ObjectStore);

    var store = new Store({ fname: "John" });

    expect(store.data).to.contain.all.keys("fname");

    store.reset({ lname: "Smith" });

    expect(store.data).to.contain.all.keys("lname");
  });

  it("clear", function () {
    var store = new Fluxo.ObjectStore({ name: "Fluxo" });

    expect(store.data).to.contain.all.keys("name");

    store.clear();

    expect(store.data).to.not.contain.key("name");
  });

  describe("default values", function () {
    it("initialise with default values", function () {
      var Store = (function (_Fluxo$ObjectStore9) {
        _inherits(Store, _Fluxo$ObjectStore9);

        function Store() {
          _classCallCheck(this, Store);

          _get(Object.getPrototypeOf(Store.prototype), "constructor", this).apply(this, arguments);
        }

        return Store;
      })(Fluxo.ObjectStore);

      Store.attributes = {
        name: { defaultValue: "Fluxo" }
      };

      var store = new Store();

      expect(store.data).to.be.eql({ name: "Fluxo" });
    });

    it("allow to override the default values", function () {
      var Store = (function (_Fluxo$ObjectStore10) {
        _inherits(Store, _Fluxo$ObjectStore10);

        function Store() {
          _classCallCheck(this, Store);

          _get(Object.getPrototypeOf(Store.prototype), "constructor", this).apply(this, arguments);
        }

        return Store;
      })(Fluxo.ObjectStore);

      Store.attributes = {
        name: { defaultValue: "Redux" }
      };

      var store = new Store({ name: "Fluxo" });

      expect(store.data).to.be.eql({ name: "Fluxo" });
    });
  });

  it("custom dump generates the specified value", function () {
    var Store = (function (_Fluxo$ObjectStore11) {
      _inherits(Store, _Fluxo$ObjectStore11);

      function Store() {
        _classCallCheck(this, Store);

        _get(Object.getPrototypeOf(Store.prototype), "constructor", this).apply(this, arguments);
      }

      return Store;
    })(Fluxo.ObjectStore);

    Store.attributes = {
      name: { dump: function dump(value) {
          return value[0];
        } }
    };

    var store = new Store({ name: "Fluxo" });

    expect(store.toJSON()["name"]).to.be.eql("F");
  });

  describe("children events bubbling", function () {
    it("parent setup the bubbling", function () {
      var parentStore = new Fluxo.ObjectStore();
      var childStore = new Fluxo.ObjectStore();
      var setStoreCallback = chai.spy();
      var setStoreAttributeCallback = chai.spy();

      parentStore.on(["change:child", "change"], setStoreCallback);

      parentStore.setAttribute("child", childStore);

      expect(setStoreCallback).to.have.been.called.twice();

      parentStore.on(["change:child:name", "change:child", "change"], setStoreAttributeCallback);

      childStore.setAttribute("name", "Fluxo");

      expect(setStoreAttributeCallback).to.have.been.called.exactly(3);
    });

    it("parent remove the bubbling setup on change", function () {
      var parentStore = new Fluxo.ObjectStore();
      var firstChildStore = new Fluxo.ObjectStore();
      var otherChildStore = new Fluxo.ObjectStore();
      var setStoreAttributeCallback = chai.spy();

      parentStore.setAttribute("child", firstChildStore);

      parentStore.setAttribute("child", otherChildStore);

      parentStore.on(["change:child:name"], setStoreAttributeCallback);

      firstChildStore.setAttribute("name", "Fluxo");

      expect(setStoreAttributeCallback).to.not.have.been.called();
    });

    it("parent remove the bubbling setup on unset", function () {
      var parentStore = new Fluxo.ObjectStore();
      var childStore = new Fluxo.ObjectStore();
      var setStoreAttributeCallback = chai.spy();

      parentStore.setAttribute("child", childStore);

      parentStore.on(["change:child:name"], setStoreAttributeCallback);

      parentStore.unsetAttribute("child");

      childStore.setAttribute("name", "Fluxo");

      expect(setStoreAttributeCallback).to.not.have.been.called();
    });

    it("setup with different classes", function () {
      var Post = (function (_Fluxo$ObjectStore12) {
        _inherits(Post, _Fluxo$ObjectStore12);

        function Post() {
          _classCallCheck(this, Post);

          _get(Object.getPrototypeOf(Post.prototype), "constructor", this).apply(this, arguments);
        }

        return Post;
      })(Fluxo.ObjectStore);

      var Author = (function (_Fluxo$ObjectStore13) {
        _inherits(Author, _Fluxo$ObjectStore13);

        function Author() {
          _classCallCheck(this, Author);

          _get(Object.getPrototypeOf(Author.prototype), "constructor", this).apply(this, arguments);
        }

        return Author;
      })(Fluxo.ObjectStore);

      var post = new Post();
      var author = new Author();
      var setStoreAttributeCallback = chai.spy();

      post.on(["change:author:name"], setStoreAttributeCallback);

      post.setAttribute("author", author);

      author.setAttribute("name", "Fluxo");

      expect(setStoreAttributeCallback).to.have.been.called();
    });
  });
});

},{}],3:[function(require,module,exports){
"use strict";

require("./object_store_specs.js");
require("./collection_specs.js");

},{"./collection_specs.js":1,"./object_store_specs.js":2}]},{},[3]);
