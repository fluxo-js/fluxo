import Radio from "./fluxo.radio.js";
import extend from "./fluxo.extend.js";

var storesUUID = 1;

class ObjectStore {
  constructor () {
    this.initialize(...arguments);
    this.firstComputation();
  }

  initialize (data={}) {
    this.cid = `FS:${storesUUID++}`;

    this.released = false;

    this.data = {};

    this.storeAttributesEventsCanceler = {};

    this.computed = (this.constructor.computed || {});

    this.attributeParsers = (this.constructor.attributeParsers || {});

    this.signedEventsCancelers = [];

    this.setDefaults();

    this.set(data);

    this.registerComputed();
  }

  getDefaults () {
    if (!this.constructor.defaults) { return; }

    return JSON.parse(JSON.stringify(this.constructor.defaults));
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

  on (events, callback) {
    var cancelers = [];

    for (let i = 0, l = events.length; i < l; i++) {
      let eventName = events[i],
          changeEventToken = `${this.cid}:${eventName}`,
          canceler = Radio.subscribe(changeEventToken, callback.bind(this));

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

  triggerEvent (eventName, ...args) {
    var changeChannel = `${this.cid}:${eventName}`;

    Radio.publish(changeChannel, this, ...args);

    Radio.publish(`${this.cid}:*`, eventName, this, ...args);
  }

  getComputed (attributeName) {
    if (!this[attributeName]) {
      throw new Error(`Compute function to "${attributeName}" value is not defined.`);
    }

    return this[attributeName].call(this);
  }

  computeValue (attributeName) {
    this.setAttribute(attributeName, this.getComputed(attributeName));
  }

  registerComputed () {
    for (let attributeName in this.computed) {
      let toComputeEvents = this.computed[attributeName];
      this.on(toComputeEvents, this.computeValue.bind(this, attributeName));
    }
  }

  takeDownStoreAttribute (attributeName, release=false) {
    this.storeAttributesEventsCanceler[attributeName].call();

    delete this.storeAttributesEventsCanceler[attributeName];

    if (release) {
      this.data[attributeName].release();
    }
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
        delete this.lastGeneratedJSON;
      }
    };

    this.storeAttributesEventsCanceler[attribute] =
      store.on(["*"], onStoreEvent.bind(this, attribute));
  }

  setAttribute (attribute, value, options={}) {
    options = { releaseNested: true, ...options };

    if (typeof attribute !== "string") {
      throw new Error(`The "attribute" argument on store's "setAttribute" function must be a string.`);
    }

    if (this.released) {
      throw new Error(`This store is already released and it can't be used.`);
    }

    if (this.data[attribute] === value) { return; }

    delete this.lastGeneratedJSON;

    if (this.attributeParsers[attribute]) {
      value = this.attributeParsers[attribute].call(this, value);
    }

    if (this.data[attribute] instanceof ObjectStore) {
      this.takeDownStoreAttribute(attribute, options.releaseNested);
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

  unsetAttribute  (attribute, options={}) {
    options = { releaseNested: true, ...options };

    if (this.data[attribute] instanceof ObjectStore) {
      this.takeDownStoreAttribute(attribute, options.releaseNested);
    }

    delete this.data[attribute];

    delete this.lastGeneratedJSON;

    this.triggerEvent(`change:${attribute}`);

    if (options.silentGlobalChange) { return; }

    this.triggerEvent("change");
  }

  set (data, options={}) {
    if (typeof data !== "object") {
      throw new Error(`The "data" argument on store's "set" function must be an object.`);
    }

    for (let key in data) {
      this.setAttribute(key, data[key], { ...options, silentGlobalChange: true });
    }

    this.triggerEvent("change");
  }

  cancelSignedEvents () {
    for (let i = 0, l = this.signedEventsCancelers.length; i < l; i++) {
      let canceler = this.signedEventsCancelers[i];
      canceler.call();
    }
  }

  release (options={}) {
    options = { releaseNested: true, ...options };

    this.cancelSignedEvents();

    for (let attributeName in this.data) {
      if (attributeName instanceof ObjectStore) {
        this.takeDownStoreAttribute(attributeName, options.releaseNested);
      }
    }

    this.released = true;
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
    for (let key in this.data) {
      if (!this.computed.hasOwnProperty(key)) {
        this.unsetAttribute(key, { ...options, silentGlobalChange: false });
      }
    }

    if (!options.silentGlobalChange) {
      this.triggerEvent("change");
    }
  }

  toJSON () {
    if (!this.lastGeneratedJSON) {
      this.lastGeneratedJSON = JSON.parse(JSON.stringify(this.data));
      this.lastGeneratedJSON.cid = this.cid;
    }

    return this.lastGeneratedJSON;
  }
};

export default ObjectStore;
