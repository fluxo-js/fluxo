describe("Fluxo.Radio", function () {
  describe("#subscribe", function () {
    it("subscribes to an event", function () {
      var radio = new Fluxo.Radio,
          callback = chai.spy();

      radio.subscribe("event", callback);
      radio.publish("event");

      expect(callback).to.have.been.called();
    });

    it("returns a function that removes the subscription", function () {
      var radio = new Fluxo.Radio,
          callback = chai.spy(),
          canceler = radio.subscribe("event", callback);

      canceler();
      radio.publish("event");

      expect(callback).to.not.have.been.called();
    });
  });

  describe("#removeSubscription", function () {
    it("unsubscribes an event", function () {
      var radio = new Fluxo.Radio,
          callback = chai.spy();

      radio.subscribe("event", callback);
      radio.removeSubscription("event", callback);
      radio.publish("event");

      expect(callback).to.not.have.been.called();
    });
  });

  describe("#on", function () {
    it("subscribes to an array of events", function () {
      var radio = new Fluxo.Radio,
          callback = chai.spy();

      radio.on(["eventOne", "eventTwo"], callback);
      radio.publish("eventOne");
      radio.publish("eventTwo");

      expect(callback).to.have.been.called.twice();
    });

    it("returns a function that removes all subscriptions", function () {
      var radio = new Fluxo.Radio,
          callback = chai.spy(),
          canceler = radio.on(["eventOne", "eventTwo"], callback);

      canceler();
      radio.publish("eventOne");
      radio.publish("eventTwo");

      expect(callback).to.not.have.been.called();
    });
  });

  describe("#triggerEvents", function () {
    it("triggers an array of events", function () {
      var radio = new Fluxo.Radio,
          callback = chai.spy();

      radio.on(["eventOne", "eventTwo"], callback);
      radio.triggerEvents(["eventOne", "eventTwo"]);

      expect(callback).to.have.been.called.twice();
    });

    it("triggers the wildcard event", function () {
      var radio = new Fluxo.Radio,
          callback = chai.spy();

      radio.subscribe("*", callback);
      radio.triggerEvents(["event"]);

      expect(callback).to.have.been.called();
    });
  });

  describe("#triggerEvent", function () {
    it("triggers an event", function () {
      var radio = new Fluxo.Radio,
          callback = chai.spy();

      radio.subscribe("event", callback);
      radio.triggerEvent("event");

      expect(callback).to.have.been.called();
    });

    it("triggers the wildcard event", function () {
      var radio = new Fluxo.Radio,
          callback = chai.spy();

      radio.subscribe("*", callback);
      radio.triggerEvent("event");

      expect(callback).to.have.been.called();
    });
  });
});
