export default function(toExtend={}, ...extensions) {
  for (var i = 0, l = extensions.length; i < l; i ++) {
    var extension = extensions[i];

    for (var extensionProperty in extension) {
      toExtend[extensionProperty] = extension[extensionProperty];
    }
  }

  return toExtend;
};
