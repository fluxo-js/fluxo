Fluxo.WatchComponent = {
  storesOnChangeCancelers: [],

  getInitialState: function() {
    var state = {};

    for (var i = 0, l = this.listenProps.length; i < l; i ++) {
      var storeIdentifierProp = this.listenProps[i],
          store = this.props[storeIdentifierProp];

      state[storeIdentifierProp] = store.toJSON();
    }

    return state;
  },

  componentWillMount: function() {
    for (var i = 0, l = this.listenProps.length; i < l; i ++) {
      var storeIdentifierProp = this.listenProps[i],
          store = this.props[storeIdentifierProp];

      this.listenStore(store);
    }
  },

  listenStore: function(store) {
    var canceler =
      store.onChange(function() {
        var state = {}

        state[storeIdentifierProp] = store.toJSON();

        this.setState(state);
      }.bind(this));

    this.storesOnChangeCancelers.push(canceler);
  },

  componentWillUnmount: function() {
    for (var i = 0, l = this.storesOnChangeCancelers.length; i < l; i ++) {
      this.storesOnChangeCancelers[i].apply();
    }
  }
};
