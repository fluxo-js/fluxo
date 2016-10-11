class Radio {
  constructor () {
    this.signedEventsCancelers = [];

    this.events = {};
  }

  subscribe (eventName, callback) {
    if (typeof callback !== "function") {
      throw new Error("Callback must be a function");
    }

    this.events[eventName] = (this.events[eventName] || []);

    this.events[eventName].push(callback);

    return this.removeSubscription.bind(this, eventName, callback);
  }

  removeSubscription (eventName, callback) {
    let index = this.events[eventName].indexOf(callback);

    this.events[eventName].splice(index, 1);

    if (!this.events[eventName]) {
      delete this.events[eventName];
    }
  }

  publish (eventName, ...args) {
    var callbacks = this.events[eventName];

    if (!callbacks) { return; }

    for (let i = 0; i < callbacks.length; i++) {
      callbacks[i].apply(null, args);
    }
  }

  on (events, callback) {
    var cancelers = [];

    for (let i = 0, l = events.length; i < l; i++) {
      let eventName = events[i],
          changeEventToken = eventName,
          canceler = this.subscribe(changeEventToken, callback.bind(this));

      cancelers.push(canceler);
    }

    var aggregatedCanceler = function() {
      for (let i = 0, l = cancelers.length; i < l; i++) {
        let canceler = cancelers[i];
        canceler.call();
      }
    };

    this.signedEventsCancelers.push(aggregatedCanceler);

    return aggregatedCanceler;
  }

  triggerEvents (eventsNames, ...args) {
    for (let i = 0, l = eventsNames.length; i < l; i++) {
      let eventName = eventsNames[i];
      this.triggerEvent(eventName, ...args);
    }
  }

  triggerEvent (eventName, ...args) {
    this.publish(eventName, ...args);

    this.publish("*", eventName, ...args);
  }
}

export default Radio;
