export default {
  parser: function (value) { return value; },
  dump: function (value) {
    if (value === undefined) { return; }
    return JSON.parse(JSON.stringify(value));
  }
};
