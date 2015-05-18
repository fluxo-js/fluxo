Fluxo.Base = function() {
  var args = Array.prototype.slice.call(arguments);

  this.data = {};
  this.options = args[1] || {};
  this.changeEventToken = Math.random().toString().slice(2, 11);

  Fluxo.Mixin.apply(null, [Object.getPrototypeOf(this)].concat(this.mixins));

  this._constructor.apply(this, args);
};

Fluxo.Base.extend = extend;

Fluxo.Base.prototype = {
  initialize: function () {},

  mixins: [],

  on: function(events, callback) {
    var cancelers = [];

    for (var i = 0, l = events.length; i < l; i ++) {
      var eventName = events[i],
          changeEventToken = (this.changeEventToken + ":" + eventName),
          canceler = Fluxo.Radio.subscribe(changeEventToken, callback.bind(this));

      cancelers.push(canceler);
    }

    var aggregatedCanceler = function() {
      for (var i = 0, l = cancelers.length; i < l; i ++) {
        var canceler = cancelers[i];
        canceler.call();
      }
    };

    return aggregatedCanceler;
  },

  trigger: function(eventsNames) {
    for (var i = 0, l = eventsNames.length; i < l; i ++) {
      var eventName = eventsNames[i];
      Fluxo.Radio.publish(this.changeEventToken + ":" + eventName);
    }
  },

  computed: {},

  attributeParsers: function() {},

  registerComputed: function() {
    for (var attributeName in this.computed) {
      var toComputeEvents = this.computed[attributeName];

      this.on(toComputeEvents, function(attrName) {
        var value = this[attrName].call(this);
        this.setAttribute(attrName, value);
      }.bind(this, attributeName));

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

    this.trigger(["change:" + attribute]);

    if (options.silentGlobalChange) { return; }

    this.trigger(["change"]);
  },

  set: function(data) {
    for (var key in data) {
      this.setAttribute(key, data[key], { silentGlobalChange: true });
    }

    this.trigger(["change"]);
  }
};
