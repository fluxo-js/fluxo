Fluxo.ObjectStore = {
  setup: function () {
    this.cid = "FS:" + Fluxo.storesUUID++;

    this._fluxo = true;

    var previousData = this.data;

    this.data = {};

    this.set(previousData || {});

    this.registerComputed();

    this.initialize();
  },

  initialize: function () {},

  create: function() {
    var extensions = Array.prototype.slice.call(arguments);

    extensions.unshift({}, this);

    var extension = Fluxo.extend.apply(null, extensions);

    extension.setup.apply(extension);

    return extension;
  },

  on: function(events, callback) {
    var cancelers = [];

    for (var i = 0, l = events.length; i < l; i++) {
      var eventName = events[i],
          changeEventToken = (this.cid + ":" + eventName),
          canceler = Fluxo.Radio.subscribe(changeEventToken, callback.bind(this));

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

  triggerEvents: function(eventsNames) {
    var args = Array.prototype.slice.call(arguments, 1);

    for (var i = 0, l = eventsNames.length; i < l; i++) {
      var eventName = eventsNames[i];
      this.triggerEvent.apply(this, [eventName].concat(args));
    }
  },

  triggerEvent: function(eventName) {
    var changeChannel = (this.cid + ":" + eventName),
        args = Array.prototype.slice.call(arguments, 1);

    Fluxo.Radio.publish.apply(
      Fluxo.Radio,
      [changeChannel, this].concat(args)
    );

    Fluxo.Radio.publish.apply(
      Fluxo.Radio,
      [(this.cid + ":*"), eventName, this].concat(args)
    );
  },

  computed: {},

  attributeParsers: function() {},

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

    this.triggerEvent(("change:" + attribute));

    if (options.silentGlobalChange) { return; }

    this.triggerEvent("change");
  },

  unsetAttribute: function (attribute, options) {
    options = options || {};

    delete this.data[attribute];

    this.triggerEvent(("change:" + attribute));

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
