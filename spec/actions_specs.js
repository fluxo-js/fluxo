describe("Fluxo Actions", function () {
  it("calls initialize", function() {
    var initializeSpy = chai.spy();

    var TodoHandler = {
      initialize: initializeSpy
    };

    Fluxo.registerActionHandler("Todos", TodoHandler, "MyOption", "MySecondOption");

    expect(initializeSpy).to.have.been.called().with("MyOption", "MySecondOption");
  });

  it("calls action", function() {
    var actionSpy = chai.spy();

    var TodoHandler = {
      myAction: actionSpy
    };

    Fluxo.registerActionHandler("Todos", TodoHandler);

    Fluxo.callAction("Todos", "myAction", "first", "second");

    expect(actionSpy).to.have.been.called.with("first", "second");
  });
});
