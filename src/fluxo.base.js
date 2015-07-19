Fluxo.Base = function() {
  var args = Array.prototype.slice.call(arguments);

  this.data = {};
  this.options = args[1] || {};
  this.changeEventToken = (Fluxo.storesUUID++);

  this._constructor.apply(this, args);
};

Fluxo.Base.extend = extend;

Fluxo.Base.prototype = {
  initialize: function () {},

  on: function(events, callback) {
    var cancelers = [];

    for (var i = 0, l = events.length; i < l; i++) {
      var eventName = events[i],
          changeEventToken = (this.changeEventToken + ":" + eventName),
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
    var changeChannel = (this.changeEventToken + ":" + eventName),
        args = Array.prototype.slice.call(arguments, 1);

    Fluxo.Radio.publish.apply(
      Fluxo.Radio,
      [changeChannel, this].concat(args)
    );

    Fluxo.Radio.publish.apply(
      Fluxo.Radio,
      [(this.changeEventToken + ":*"), eventName, this].concat(args)
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

  set: function(data) {
    for (var key in data) {
      this.setAttribute(key, data[key], { silentGlobalChange: true });
    }

    this.triggerEvent("change");
  }
};
