describe("Fluxo.Radio", function () {
  it("works", function() {
    var firstCallback = chai.spy(),
        secondCallback = chai.spy();

    Fluxo.Radio.subscribe("myEvent", firstCallback);

    var canceler = Fluxo.Radio.subscribe("myEvent", secondCallback);

    Fluxo.Radio.publish("myEvent");

    canceler.call();

    Fluxo.Radio.publish("myEvent");

    expect(firstCallback).to.have.been.called.twice();
    expect(secondCallback).to.have.been.called.once();
  });
});
