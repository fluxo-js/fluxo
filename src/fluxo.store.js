Fluxo.Store = function(data, options) {
  // Copy data to not mutate the original object
  if (data) {
    data = JSON.parse(JSON.stringify(data));
  }

  this.data = data || {};
  this.options = options || {};
  this.changeEventToken = Math.random().toString().slice(2, 11);

  Fluxo.Mixin.apply(null, [Object.getPrototypeOf(this)].concat(this.mixins));

  this.initialize(data, options);
};

Fluxo.Store.extend = extend;

Fluxo.Store.prototype = {
  initialize: function () {},

  mixins: [],

  toJSON: function() {
    return this.data;
  },

  setAttribute: function(attribute, value) {
    this.data[attribute] = value;

    this.emitChange();
  },

  set: function(data) {
    Fluxo.extend(this.data, data);

    this.emitChange();
  },

  onChange: function(callback) {
    return Fluxo.Radio.subscribe(this.changeEventToken, callback.bind(this));
  },

  emitChange: function() {
    Fluxo.Radio.publish(this.changeEventToken, this.toJSON());
  }
};
