module.exports = function(toExtend) {
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
