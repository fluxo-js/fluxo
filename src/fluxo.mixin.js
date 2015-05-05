Fluxo.Mixin = function(toMix) {
  var mixins = Array.prototype.slice.call(arguments, 1);

  var aggregateProperty = function(propName, property) {
    var existingProp = toMix[propName];

    toMix[propName] = function () {
      var args = Array.prototype.slice.call(arguments);

      property.apply(toMix, args);

      return existingProp.apply(toMix, args);
    };
  };

  var mix = function(mixin) {
    for (var propName in mixin) {
      var property = mixin[propName];

      if (toMix.hasOwnProperty(propName) && typeof(property) === "function") {
        aggregateProperty(propName, property);
      } else if (typeof(property) === "function") {
        toMix[propName] = property.bind(toMix);
      } else {
        toMix[propName] = property;
      }
    }
  };

  for (var i = 0, l = mixins.length; i < l; i ++) {
    var mixin = mixins[i];
    mix(mixin);
  }
};
