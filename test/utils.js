import { readFileSync, readFile } from 'fs';
import { equal } from 'assert';
var fileOptions = {encoding: 'utf-8'};

import { transpile } from '../src/Transpiler.js';

var cwd = process.cwd();

function getCode(lePath) {
  // from main.js
  var data = readFileSync(lePath, 'utf-8');
  return transpile(data, lePath).toStringWithSourceMap({ file: `${lePath}-sourceMap`});
}

export function doTest(pathPart, doneCallback) {
  var input = getCode(cwd + '/test/fixtures/' + pathPart + '.arnoldc');

  readFile(cwd + '/test/fixtures/' + pathPart + '.js', fileOptions, function(err, expected) {
    if (err) {
      console.log('error with ' + pathPart, err);
    }

    /*jslint evil: true */
    equal(eval(input.code), eval(expected));
    equal(!!input.map, true);
    doneCallback();
  });
}