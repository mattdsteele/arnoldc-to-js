var sourceMap = require('source-map'),
  SourceNode = sourceMap.SourceNode;

module.exports.withSourceMaps = function(nodes, fileName) {
  var preamble = new SourceNode(null, null, null, '')
    .add('(function() {\n "use strict";\n');

  var codes = nodes.forEach(function(expr) {
    preamble.add(expr.compile(1, fileName));
  });

  var postscript = new SourceNode(null, null, null, '')
    .add('}());');

  preamble.add(postscript);

  return preamble;
};
