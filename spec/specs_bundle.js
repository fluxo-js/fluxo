(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

describe("Fluxo.CollectionStore", function () {
  it("parsing store's data on collection's store object", function () {
    var Collection = (function (_Fluxo$CollectionStore) {
      _inherits(Collection, _Fluxo$CollectionStore);

      function Collection() {
        _classCallCheck(this, Collection);

        _get(Object.getPrototypeOf(Collection.prototype), "constructor", this).apply(this, arguments);
      }

      return Collection;
    })(Fluxo.CollectionStore);

    var Store = (function (_Fluxo$ObjectStore) {
      _inherits(Store, _Fluxo$ObjectStore);

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

  it("#addStore", function () {
    var collection = new Fluxo.CollectionStore(),
        onChangeCallback = chai.spy();

    collection.on(["change"], onChangeCallback);

    var store = collection.addStore({ name: "Samuel" });

    expect(collection.toJSON()).to.be.eql({
      cid: collection.cid,
      stores: [{ cid: store.cid, name: "Samuel" }]
    });
    expect(onChangeCallback).to.have.been.called();
  });

  it("calls onChangeCallback when a child store changes", function () {
    var collection = new Fluxo.CollectionStore([{ name: "Samuel" }]),
        onChangeCallback = chai.spy(),
        onStoreNameChangeCallback = chai.spy();

    collection.on(["stores:change"], onChangeCallback);
    collection.on(["stores:change:name"], onStoreNameChangeCallback);

    collection.stores[0].setAttribute("name", "Samuel S");
    expect(onChangeCallback).to.have.been.called();
    expect(onStoreNameChangeCallback).to.have.been.called();
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
    expect(onChangeCallback).to.not.have.been.called();
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
  });

  it("#setStores", function () {
    var collection = new Fluxo.CollectionStore();

    var store1 = new Fluxo.ObjectStore({ id: 1, name: "Samuel" });

    collection.addStore(store1);

    collection.setStores([{ id: 1, name: "Simões" }, { id: 2, name: "Foo" }]);

    expect(store1.data.name).to.be.eql("Simões");
    expect(collection.stores).to.be.eql([store1, collection.find(2)]);
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

    var Store = (function (_Fluxo$ObjectStore2) {
      _inherits(Store, _Fluxo$ObjectStore2);

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

  describe("default values", function () {
    it("initialise with default values", function () {
      var Collection = (function (_Fluxo$CollectionStore4) {
        _inherits(Collection, _Fluxo$CollectionStore4);

        function Collection() {
          _classCallCheck(this, Collection);

          _get(Object.getPrototypeOf(Collection.prototype), "constructor", this).apply(this, arguments);
        }

        return Collection;
      })(Fluxo.CollectionStore);

      Collection.defaults = {
        name: "Fluxo"
      };

      var store = new Collection();

      expect(store.data).to.be.eql({ name: "Fluxo" });
    });

    it("allow to override the default values", function () {
      var Collection = (function (_Fluxo$CollectionStore5) {
        _inherits(Collection, _Fluxo$CollectionStore5);

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
    it("subset computing", function () {
      var Collection = (function (_Fluxo$CollectionStore6) {
        _inherits(Collection, _Fluxo$CollectionStore6);

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
        online: ["stores:change:online"]
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
  });

  it("#setAttribute", function () {
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
    expect(onChangeNameCallback).to.have.been.called();
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
    expect(store.toJSON()).to.be.eql({ cid: store.cid, name: "Samuel" });
  });

  it("computed attributes", function () {
    var Store = (function (_Fluxo$ObjectStore) {
      _inherits(Store, _Fluxo$ObjectStore);

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

  it("attributes parser", function () {
    var Store = (function (_Fluxo$ObjectStore2) {
      _inherits(Store, _Fluxo$ObjectStore2);

      function Store() {
        _classCallCheck(this, Store);

        _get(Object.getPrototypeOf(Store.prototype), "constructor", this).apply(this, arguments);
      }

      return Store;
    })(Fluxo.ObjectStore);

    ;

    Store.attributeParsers = {
      count: function count(value) {
        return parseInt(value, 10);
      }
    };

    var store = new Store({ count: "1" });

    expect(store.data.count).to.be.eql(1);
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
    var store = new Fluxo.ObjectStore({ name: "Fluxo" });

    expect(store.data).to.contain.all.keys({ name: "Fluxo" });

    store.reset({ type: "Object" });

    expect(store.data).to.contain.all.keys({ type: "Object" });
    expect(store.data).to.not.contain.key("name");
  });

  describe("default values", function () {
    it("initialise with default values", function () {
      var Store = (function (_Fluxo$ObjectStore3) {
        _inherits(Store, _Fluxo$ObjectStore3);

        function Store() {
          _classCallCheck(this, Store);

          _get(Object.getPrototypeOf(Store.prototype), "constructor", this).apply(this, arguments);
        }

        return Store;
      })(Fluxo.ObjectStore);

      Store.defaults = {
        name: "Fluxo"
      };

      var store = new Store();

      expect(store.data).to.be.eql({ name: "Fluxo" });
    });

    it("allow to override the default values", function () {
      var Store = (function (_Fluxo$ObjectStore4) {
        _inherits(Store, _Fluxo$ObjectStore4);

        function Store() {
          _classCallCheck(this, Store);

          _get(Object.getPrototypeOf(Store.prototype), "constructor", this).apply(this, arguments);
        }

        return Store;
      })(Fluxo.ObjectStore);

      Store.defaults = {
        name: "Redux"
      };

      var store = new Store({ name: "Fluxo" });

      expect(store.data).to.be.eql({ name: "Fluxo" });
    });
  });
});

},{}],3:[function(require,module,exports){
"use strict";

describe("Fluxo.Radio", function () {
  it("works", function () {
    var firstCallback = chai.spy(),
        secondCallback = chai.spy();

    Fluxo.Radio.subscribe("myEvent", firstCallback);

    var canceler = Fluxo.Radio.subscribe("myEvent", secondCallback);

    Fluxo.Radio.publish("myEvent");

    canceler.call();

    Fluxo.Radio.publish("myEvent");

    expect(firstCallback).to.have.been.called.twice();
    expect(secondCallback).to.have.been.called.once();
  });
});

},{}],4:[function(require,module,exports){
"use strict";

require("./object_store_specs.js");
require("./collection_specs.js");
require("./radio_specs.js");

},{"./collection_specs.js":1,"./object_store_specs.js":2,"./radio_specs.js":3}]},{},[4]);
