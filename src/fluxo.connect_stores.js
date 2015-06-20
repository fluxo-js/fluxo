Fluxo.ConnectStores = function (Component, stores) {
  return React.createClass({
    storesOnChangeCancelers: [],

    getInitialState: function() {
      return this.storesState();
    },

    storesState: function() {
      var state = {};

      for (var storeName in stores) {
        var store = stores[storeName];
        state[storeName] = store.toJSON();
      }

      return state;
    },

    updateComponentState: function() {
      this.setState(this.storesState);
    },

    componentWillMount: function() {
      for (var storeName in stores) {
        var store = stores[storeName];
        this.listenStore(store);
      }
    },

    listenStore: function(store) {
      var canceler = store.on(["change"], this.updateComponentState.bind(this));
      this.storesOnChangeCancelers.push(canceler);
    },

    componentWillUnmount: function() {
      for (var i = 0, l = this.storesOnChangeCancelers.length; i < l; i ++) {
        this.storesOnChangeCancelers[i].call();
      }
    },

    render: function() {
      return React.createElement(Component, Fluxo.extend({}, this.props, this.state));
    }
  });
};
