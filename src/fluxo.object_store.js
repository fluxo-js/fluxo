import defaultAttributeContract from "./fluxo.default_attribute_contract.js";

var storesUUID = 1;

class ObjectStore {
  constructor () {
    this.initialize(...arguments);
    this.firstComputation();
  }

  initialize (data={}) {
    this.cid = `FS:${storesUUID++}`;

    this.data = {};

    this.storeAttributesEventsCanceler = {};

    this.computed = (this.constructor.computed || {});

    this.onChangeComputedProperties = [];

    this.attributeParsers = (this.constructor.attributeParsers || {});

    this.signedEventsCancelers = [];

    this.events = {};

    this.setDefaults();

    this.set(data);

    this.registerComputed();

    this.on(["change"], function () {
      delete this.lastGeneratedJSON;
    });

    this.warnMissingAttributes();
  }

  warnMissingAttributes () {
    if (!this.constructor.attributes) { return; }

    for (let attributeName in this.constructor.attributes) {
      this.warnMissingAttribute(attributeName, this.data[attributeName]);
    }
  }

  warnMissingAttribute (attributeName, value) {
    if (!this.contract(attributeName).required) { return; }

    if (!(value === undefined || value === null)) { return; }

    var identifier = "";

    if (this.data.id) {
      identifier = `id: ${this.data.id}`;
    } else {
      identifier = `cid: ${this.cid}`;
    }

    var message = `Warning: missing the required "${attributeName}" attribute on the "${this.constructor.name}" store (${identifier})`;

    if (console.warn) {
      console.warn(message);
    } else {
      console(message);
    }
  }

  getDefaults () {
    if (!this.constructor.attributes) { return; }

    var defaults = {};

    for (let attributeName in this.constructor.attributes) {
      defaults[attributeName] = this.contract(attributeName).defaultValue;
    }

    return JSON.parse(JSON.stringify(defaults));
  }

  setDefaults (options={ silentGlobalChange: false }) {
    let data = this.getDefaults();

    for (let key in data) {
      this.setAttribute(key, data[key], options);
    }
  }

  firstComputation () {
    for (let attributeName in this.computed) {
      this.computeValue(attributeName);
    }
  }

  subscribe (eventName, callback) {
    if (typeof callback !== "function") {
      throw new Error("Callback must be a function");
    }

    this.events[eventName] = (this.events[eventName] || []);

    this.events[eventName].push(callback);

    return this.removeSubscription.bind(this, eventName, callback);
  }

  removeSubscription (eventName, callback) {
    let index = this.events[eventName].indexOf(callback);

    this.events[eventName].splice(index, 1);

    if (!this.events[eventName]) {
      delete this.events[eventName];
    }
  }

  publish (eventName, ...args) {
    var callbacks = this.events[eventName];

    if (!callbacks) { return; }

    for (let i = 0; i < callbacks.length; i++) {
      callbacks[i].apply(null, args);
    }
  }

  on (events, callback) {
    var cancelers = [];

    for (let i = 0, l = events.length; i < l; i++) {
      let eventName = events[i],
          changeEventToken = eventName,
          canceler = this.subscribe(changeEventToken, callback.bind(this));

      cancelers.push(canceler);
    }

    var aggregatedCanceler = function() {
      for (let i = 0, l = cancelers.length; i < l; i++) {
        let canceler = cancelers[i];
        canceler.call();
      }
    };

    this.signedEventsCancelers.push(aggregatedCanceler);

    return aggregatedCanceler;
  }

  triggerEvents (eventsNames, ...args) {
    for (let i = 0, l = eventsNames.length; i < l; i++) {
      let eventName = eventsNames[i];
      this.triggerEvent(eventName, ...args);
    }
  }

  computeOnChangeComputedProperties () {
    for (let i = 0, l = this.onChangeComputedProperties.length; i < l; i++) {
      this.computeValue(this.onChangeComputedProperties[i]);
    }
  }

  beforeTriggerEvent (eventName) {
    if (eventName === "change") {
      this.computeOnChangeComputedProperties();
    }
  }

  triggerEvent (eventName, ...args) {
    this.beforeTriggerEvent(eventName);

    this.publish(eventName, this, ...args);

    this.publish("*", eventName, this, ...args);
  }

  getComputed (attributeName) {
    if (!this[attributeName]) {
      throw new Error(`Compute function to "${attributeName}" value is not defined.`);
    }

    return this[attributeName].call(this);
  }

  computeValue (attributeName) {
    this.setAttribute(
      attributeName,
      this.getComputed(attributeName),
      { silentGlobalChange: true }
    );
  }

  registerComputed () {
    for (let attributeName in this.computed) {
      let toComputeEvents = this.computed[attributeName];

      if (toComputeEvents.indexOf("change") !== -1 && toComputeEvents.length > 1) {
        throw new Error(`You can't register a COMPUTED PROPERTY (${this.constructor.name}#${attributeName}) with the "change" event and other events. The "change" event will be called on every change so you don't need complement with other events.`);
      }

      if (toComputeEvents.indexOf("change") === 1) {
        this.onChangeComputedProperties.push(attributeName);
      } else {
        this.on(toComputeEvents, this.computeValue.bind(this, attributeName));
      }
    }
  }

  stopListenStoreAttribute (attributeName) {
    this.storeAttributesEventsCanceler[attributeName].call();
    delete this.storeAttributesEventsCanceler[attributeName];
  }

  listenStoreAttribute (attribute, store) {
    let onStoreEvent = function(attributeName, eventName, ...args) {
      if (eventName !== "change") {
        this.triggerEvent(
          `change:${attributeName}:${eventName.replace(/^change:/, '')}`,
          ...args
        );
      }

      if (eventName === "change" || eventName === "stores:change") {
        this.triggerEvent(`change:${attributeName}`);
        this.triggerEvent(`change`);
      }
    };

    this.storeAttributesEventsCanceler[attribute] =
      store.on(["*"], onStoreEvent.bind(this, attribute));
  }

  contract (attributeName) {
    if (this.constructor.attributes && this.constructor.attributes[attributeName]) {
      return this.constructor.attributes[attributeName];
    } else {
      return {};
    }
  }

  parser (attributeName) {
    return this.contract(attributeName).parser || defaultAttributeContract.parser;
  }

  dump (attributeName) {
    return this.contract(attributeName).dump || defaultAttributeContract.dump;
  }

  setAttribute (attribute, value, options) {
    if (typeof attribute !== "string") {
      throw new Error(`The "attribute" argument on store's "setAttribute" function must be a string.`);
    }

    options = options || {};

    if (this.data[attribute] === value) { return; }

    delete this.lastGeneratedJSON;

    value = this.parser(attribute).call(this, value);

    this.warnMissingAttribute(attribute, value);

    if (this.data[attribute] instanceof ObjectStore) {
      this.stopListenStoreAttribute(attribute);
    }

    if (value instanceof ObjectStore) {
      this.listenStoreAttribute(attribute, value);
    }

    let previousValue = this.data[attribute];

    this.data[attribute] = value;

    this.triggerEvent(`change:${attribute}`, previousValue);

    if (options.silentGlobalChange) { return; }

    this.triggerEvent("change");
  }

  unsetAttribute  (attribute, options) {
    options = options || {};

    this.warnMissingAttribute(attribute);

    if (this.data[attribute] instanceof ObjectStore) {
      this.stopListenStoreAttribute(attribute);
    }

    delete this.data[attribute];

    this.triggerEvent(`change:${attribute}`);

    if (options.silentGlobalChange) { return; }

    this.triggerEvent("change");
  }

  set (data, options={ silentGlobalChange: false }) {
    if (typeof data !== "object") {
      throw new Error(`The "data" argument on store's "set" function must be an object.`);
    }

    for (let key in data) {
      this.setAttribute(key, data[key], { silentGlobalChange: true });
    }

    if (!options.silentGlobalChange) {
      this.triggerEvent("change");
    }
  }

  cancelSignedEvents () {
    for (let i = 0, l = this.signedEventsCancelers.length; i < l; i++) {
      let canceler = this.signedEventsCancelers[i];
      canceler.call();
    }
  }

  reset (data={}) {
    let attributes = { ...this.data },
        defaults = this.getDefaults();

    for (let attributeName in this.computed) {
      delete attributes[attributeName];
    }

    for (let attributeName in data) {
      this.setAttribute(attributeName, data[attributeName], { silentGlobalChange: true });
      delete attributes[attributeName];
      delete defaults[attributeName];
    }

    for (let attributeName in defaults) {
      this.setAttribute(attributeName, defaults[attributeName], { silentGlobalChange: true });
      delete attributes[attributeName];
    }

    for (let attributeName in attributes) {
      this.unsetAttribute(attributeName, { silentGlobalChange: true });
    }

    this.triggerEvent("change");
  }

  clear (options={}) {
    options = { silentGlobalChange: false, ...options };

    for (let key in this.data) {
      if (!this.computed.hasOwnProperty(key)) {
        this.unsetAttribute(key, { silentGlobalChange: true });
      }
    }

    if (!options.silentGlobalChange) {
      this.triggerEvent("change");
    }
  }

  attributesToJSON () {
    let data = {};

    for (var attributeName in this.data) {
      data[attributeName] =
        this.dump(attributeName).call(this, this.data[attributeName]);
    }

    return { ...data, cid: this.cid };
  }

  toJSON () {
    if (!this.lastGeneratedJSON) {
      this.lastGeneratedJSON = this.attributesToJSON();
    }

    return this.lastGeneratedJSON;
  }
};

export default ObjectStore;
