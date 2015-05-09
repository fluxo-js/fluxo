Fluxo.Store = Fluxo.Base.extend({
  _constructor: function(data, options) {
    // Copy data to not mutate the original object
    if (data) {
      data = JSON.parse(JSON.stringify(data));
    }

    this.set(data || {});

    this.initialize(data, options);
  },

  toJSON: function() {
    return this.data;
  }
});
