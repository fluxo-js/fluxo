describe("Fluxo Mixins", function () {
  it("works", function() {
    var mixinFunction = chai.spy(),
        toMixFunction = chai.spy(),
        mixinHello = chai.spy();

    var mixin = {
      hello: mixinFunction,

      name: "helloMixin",

      mixinHello: mixinHello
    };

    var toMix = {
      hello: toMixFunction
    };

    Fluxo.Mixin(toMix, mixin);

    toMix.hello("MyOption", "MySecondOption");
    toMix.mixinHello("MyOption", "MySecondOption");

    expect(toMixFunction).to.have.been.called.with("MyOption", "MySecondOption");
    expect(mixinFunction).to.have.been.called.with("MyOption", "MySecondOption");
    expect(mixinHello).to.have.been.called.with("MyOption", "MySecondOption");
    expect(toMix.name).to.be.eql("helloMixin");
  });
});
