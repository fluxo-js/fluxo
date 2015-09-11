Fluxo.ObjectStore = Fluxo.Base.extend({
  _constructor: function(data, options) {
    // Copy data to not mutate the original object
    if (data) {
      data = JSON.parse(JSON.stringify(data));
    }

    this.set(data || {});

    this.registerComputed();

    this.initialize(data, options);
  },

  toJSON: function() {
    var data = JSON.parse(JSON.stringify(this.data));
    data.cid = this.cid;

    return data;
  }
});
