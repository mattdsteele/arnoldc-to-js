import jison from 'jison';
import path from 'node:path';
import fs from 'node:fs';
import * as sourceMap from 'source-map';
import * as Parser from './ast.js';
import { fileURLToPath } from 'url'
import { dirname } from 'path'
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const SourceNode = sourceMap.SourceNode;

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
  var bnf = fs.readFileSync(path.join(__dirname, './arnoldc.jison'), 'utf-8');
  var parser = new jison.Parser(bnf);
  parser.yy = Parser;
  var AST = parser.parse(source);

  var mapping = withSourceMaps(AST, fileName);
  mapping.setSourceContent(fileName, source);
  return mapping;
};

export { transpile, withSourceMaps };
