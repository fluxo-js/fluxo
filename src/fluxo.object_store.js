import Radio from "./fluxo.radio.js";
import extend from "./fluxo.extend.js";

var storesUUID = 1;

export default {
  setup: function () {
    this.cid = `FS:${storesUUID++}`;

    this._fluxo = true;

    var previousData = this.data;

    this.data = {};

    this.set(previousData || {});

    this.registerComputed();

    this.initialize();
  },

  initialize: function () {},

  create: function(...extensions) {
    let extension = extend({}, this, ...extensions);

    extension.setup.call(extension);

    return extension;
  },

  on: function(events, callback) {
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

    return aggregatedCanceler;
  },

  triggerEvents: function(eventsNames, ...args) {
    for (var i = 0, l = eventsNames.length; i < l; i++) {
      var eventName = eventsNames[i];
      this.triggerEvent(eventName, ...args);
    }
  },

  triggerEvent: function(eventName, ...args) {
    var changeChannel = `${this.cid}:${eventName}`;

    Radio.publish(changeChannel, this, ...args);

    Radio.publish(`${this.cid}:*`, eventName, this, ...args);
  },

  computed: {},

  attributeParsers: {},

  registerComputed: function() {
    var computeValue = function(attrName) {
      var value = this[attrName].call(this);
      this.setAttribute(attrName, value);
    };

    for (var attributeName in this.computed) {
      var toComputeEvents = this.computed[attributeName];

      this.on(toComputeEvents, computeValue.bind(this, attributeName));

      this.setAttribute(attributeName, this[attributeName].call(this));
    }
  },

  setAttribute: function(attribute, value, options) {
    options = options || {};

    if (this.data[attribute] === value) { return; }

    if (this.attributeParsers[attribute]) {
      value = this.attributeParsers[attribute](value);
    }

    this.data[attribute] = value;

    this.triggerEvent(`change:${attribute}`);

    if (options.silentGlobalChange) { return; }

    this.triggerEvent("change");
  },

  unsetAttribute: function (attribute, options) {
    options = options || {};

    delete this.data[attribute];

    this.triggerEvent(`change:${attribute}`);

    if (options.silentGlobalChange) { return; }

    this.triggerEvent("change");
  },

  set: function(data) {
    for (var key in data) {
      this.setAttribute(key, data[key], { silentGlobalChange: true });
    }

    this.triggerEvent("change");
  },

  reset: function (data) {
    data = data || {};

    for (var key in this.data) {
      if (data[key] === undefined) {
        this.unsetAttribute(key, { silentGlobalChange: true });
      }
    }

    for (var key in data) {
      this.setAttribute(key, data[key], { silentGlobalChange: true });
    }

    this.triggerEvent("change");
  },

  toJSON: function() {
    var data = JSON.parse(JSON.stringify(this.data));
    data.cid = this.cid;

    return data;
  }
};
