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

  var extend = function (protoProps, staticProps) {
    var parent = this,
        child;

    child = function(){ return parent.apply(this, arguments); };

    // Add static properties to the constructor function, if supplied.
    Fluxo.extend(child, parent, staticProps);

    var Surrogate = function() { this.constructor = child; };
    Surrogate.prototype = parent.prototype;
    child.prototype = new Surrogate;

    if (protoProps) {
      Fluxo.extend(child.prototype, protoProps);
    }

    child.__super__ = parent.prototype;

    return child;
  };

  @@include('fluxo.radio.js')

  @@include('fluxo.mixin.js')

  @@include('fluxo.base.js')

  @@include('fluxo.store.js')

  @@include('fluxo.collection_store.js')

  @@include('fluxo.actions.js')

  @@include('fluxo.watch_component.js')

  return Fluxo;
});
