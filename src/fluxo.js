(function(root, factory) {
  if (typeof define === "function" && define.amd) {
    define([], factory);
  } else if (typeof exports !== "undefined") {
    return module.exports = factory();
  } else {
    root.Fluxo = factory();
  }
})(this, function() {
  var Fluxo = {};

  Fluxo.extend = function(toExtend) {
    toExtend = toExtend || {};

    var extensions = Array.prototype.slice.call(arguments, 1);

    for (var i = 0, l = extensions.length; i < l; i ++) {
      var extension = extensions[i];

      for (var extensionProperty in extension) {
        toExtend[extensionProperty] = extension[extensionProperty];
      }
    }

    return toExtend;
  };

  var extend = function (props) {
    var that = this,
        child = function () { return that.apply(this, arguments); };

    Fluxo.extend(child, this);
    Fluxo.extend(this.prototype, props);
    Fluxo.extend(child.prototype, this.prototype);

    return child;
  };

  @@include('fluxo.radio.js')

  @@include('fluxo.mixin.js')

  @@include('fluxo.store.js')

  @@include('fluxo.collection_store.js')

  @@include('fluxo.actions.js')

  @@include('fluxo.watch_component.js')

  return Fluxo;
});
