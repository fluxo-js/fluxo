describe("Fluxo.ConnectStore", function () {
  it("reacts on Fluxo store", function() {
    var person = new Fluxo.Store({ name: "Samuel" });

    var Component = React.createClass({
      render: function() {
        return React.createElement("p", null, this.props.person.name);
      }
    });

    Component = Fluxo.ConnectStores(Component, { person: person });

    var shallowRenderer = React.addons.TestUtils.createRenderer();

    shallowRenderer.render(React.createElement(Component));

    var result = shallowRenderer.getRenderOutput();

    expect(result.props.person).to.be.eql({ name: "Samuel" });

    person.setAttribute("name", "Samuel Simões");

    expect(result.props.person).to.be.eql({ name: "Samuel Simões" });
  });
});
