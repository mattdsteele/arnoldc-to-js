#!/usr/bin/env node
var fs = require('fs');
var Transpiler = require('../lib/Transpiler');

if (process.argv[2]) {
  var fileName = process.argv[2];

  var ext = fileName.split('.');

  if (ext.length > 0 && ext[ext.length - 1] === 'arnoldc') {
    var mapping = Transpiler.transpile(fs.readFileSync(fileName, 'utf-8'), fileName);

    var jsFile = fileName + '.js',
      sourceMapName = jsFile + '.map';

    var output = mapping.toStringWithSourceMap({ file: sourceMapName });

    //add source map
    output.code += "\n//# sourceMappingURL=" + sourceMapName.replace(/^.*\//g, '');
    fs.writeFileSync(sourceMapName, output.map);
    fs.writeFileSync(jsFile, output.code);
  } else {
    console.log('File must have arnoldc extension');
  }
} else {
  console.log('You must specify a file');
}
