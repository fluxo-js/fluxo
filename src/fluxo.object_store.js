import Radio from "./fluxo.radio.js";
import extend from "./fluxo.extend.js";

var storesUUID = 1;

export default class {
  constructor () {
    this.initialize(...arguments);
    this.firstComputation();
  }

  initialize (data={}) {
    this.cid = `FS:${storesUUID++}`;

    this.released = false;

    this.data = {};

    this.computed = (this.constructor.computed || {});

    this.attributeParsers = (this.constructor.attributeParsers || {});

    this.signedEventsCancelers = [];

    let clonedDefaults;

    if (this.constructor.defaults) {
      clonedDefaults = JSON.parse(JSON.stringify(this.constructor.defaults));
    }

    this.set({ ...clonedDefaults, ...data });

    this.registerComputed();
  }

  firstComputation () {
    for (var attributeName in this.computed) {
      this.computeValue(attributeName);
    }
  }

  on (events, callback) {
    var cancelers = [];

    for (var i = 0, l = events.length; i < l; i++) {
      var eventName = events[i],
          changeEventToken = `${this.cid}:${eventName}`,
          canceler = Radio.subscribe(changeEventToken, callback.bind(this));

      cancelers.push(canceler);
    }

    var aggregatedCanceler = function() {
      for (var i = 0, l = cancelers.length; i < l; i++) {
        var canceler = cancelers[i];
        canceler.call();
      }
    };

    this.signedEventsCancelers.push(aggregatedCanceler);

    return aggregatedCanceler;
  }

  triggerEvents (eventsNames, ...args) {
    for (var i = 0, l = eventsNames.length; i < l; i++) {
      var eventName = eventsNames[i];
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
    for (var attributeName in this.computed) {
      var toComputeEvents = this.computed[attributeName];
      this.on(toComputeEvents, this.computeValue.bind(this, attributeName));
    }
  }

  setAttribute (attribute, value, options) {
    if (typeof attribute !== "string") {
      throw new Error(`The "attribute" argument on store's "setAttribute" function must be a string.`);
    }

    if (this.released) {
      throw new Error(`This store is already released and it can't be used.`);
    }

    options = options || {};

    if (this.data[attribute] === value) { return; }

    delete this.lastGeneratedJSON;

    if (this.attributeParsers[attribute]) {
      value = this.attributeParsers[attribute](value);
    }

    this.data[attribute] = value;

    this.triggerEvent(`change:${attribute}`);

    if (options.silentGlobalChange) { return; }

    this.triggerEvent("change");
  }

  unsetAttribute  (attribute, options) {
    options = options || {};

    delete this.data[attribute];

    delete this.lastGeneratedJSON;

    this.triggerEvent(`change:${attribute}`);

    if (options.silentGlobalChange) { return; }

    this.triggerEvent("change");
  }

  set (data) {
    if (typeof data !== "object") {
      throw new Error(`The "data" argument on store's "set" function must be an object.`);
    }

    for (var key in data) {
      this.setAttribute(key, data[key], { silentGlobalChange: true });
    }

    this.triggerEvent("change");
  }

  cancelSignedEvents () {
    for (var i = 0, l = this.signedEventsCancelers.length; i < l; i++) {
      var canceler = this.signedEventsCancelers[i];
      canceler.call();
    }
  }

  release () {
    this.cancelSignedEvents();
    this.released = true;
  }

  reset  (data) {
    data = data || {};

    for (var key in this.data) {
      if (data[key] === undefined && !this.computed.hasOwnProperty(key)) {
        this.unsetAttribute(key, { silentGlobalChange: true });
      }
    }

    for (var key in data) {
      this.setAttribute(key, data[key], { silentGlobalChange: true });
    }

    this.triggerEvent("change");
  }

  toJSON () {
    if (!this.lastGeneratedJSON) {
      this.lastGeneratedJSON = JSON.parse(JSON.stringify(this.data));
      this.lastGeneratedJSON.cid = this.cid;
    }

    return this.lastGeneratedJSON;
  }
};
