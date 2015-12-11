 export default {
  callbackIds: 1,

  events: {},

  subscribe: function(eventName, callback) {
    var subscriptionId = this.callbackIds++;

    this.events[eventName] = this.events[eventName] || {};
    this.events[eventName][subscriptionId] = callback;

    return this.removeSubscription.bind(this, eventName, subscriptionId);
  },

  removeSubscription: function(eventName, subscriptionId) {
    if (this.events[eventName]) {
      delete this.events[eventName][subscriptionId];

      if (!Object.getOwnPropertyNames(this.events[eventName]).length) {
        delete this.events[eventName];
      }
    }
  },

  publish: function(eventName, ...args) {
    var callbacks = this.events[eventName] || {};

    for (var subscriptionId in callbacks) {
      callbacks[subscriptionId].apply(null, args);
    }
  }
};
