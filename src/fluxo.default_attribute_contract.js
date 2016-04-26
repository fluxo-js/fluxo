export default {
  parser: function (value) { return value; },
  dump: function (value) { return JSON.parse(JSON.stringify(value)) }
};
