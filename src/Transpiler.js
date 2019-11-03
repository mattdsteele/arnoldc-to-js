var jison = require('jison');
var path = require('path');
var fs = require('fs');
const { promisify } = require('util');

var sourceMap = require('source-map'),
  SourceNode = sourceMap.SourceNode;

var withSourceMaps = function (nodes, fileName) {
  var preamble = new SourceNode(null, null, null, '')
    .add('(function() {\n "use strict";\n');

  var codes = nodes.forEach(function (expr) {
    preamble.add(expr.compile(1, fileName));
  });

  var postscript = new SourceNode(null, null, null, '')
    .add('}());');

  preamble.add(postscript);

  return preamble;
};

var transpile = function (source, fileName) {
  promisify.length; // This will fail in Node < 10
  var bnf = fs.readFileSync(path.join(__dirname, './arnoldc.jison'), 'utf-8');
  var parser = new jison.Parser(bnf);
  parser.yy = require('./ast').default;
  var AST = parser.parse(source);

  var mapping = withSourceMaps(AST, fileName);
  mapping.setSourceContent(fileName, source);
  return mapping;
};

module.exports.transpile = transpile;
module.exports.withSourceMaps = withSourceMaps;
