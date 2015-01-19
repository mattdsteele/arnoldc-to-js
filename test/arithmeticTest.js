'use strict';

var fs = require('fs');
var gulp = require('gulp');
var assert = require('assert');
var fileOptions = {encoding: 'utf-8'};

var parser = require('../arnoldc.js');
var Transpiler = require('../Transpiler.js');

var cwd = process.cwd();
console.log(cwd);

function getCode(lePath) {
  // from main.js
  var data = fs.readFileSync(lePath, 'utf-8');
  var AST = parser.parse(data);
  var code = Transpiler.getJSCode(AST);
  console.log(code);
  return code;
}

function doTest(pathPart, doneCallback) {
  var input = getCode(cwd + '/test/fixtures/' + pathPart + '.arnoldc');
  console.log(cwd + '/test/fixtures/' + pathPart + '_expected.js');
  fs.readFile(cwd + '/test/fixtures/' + pathPart + '_expected.js', fileOptions, function(err, expected) {
    if (err) {
      console.log('error with ' + pathPart, err);
    }
    assert.equal(input, expected);
    doneCallback();
  });
}

describe('arithmetics', function() {
  it('should function when a variable is declared', function(done) {
    doTest('arithmetics/01_var-declared', done);
  });

  it('should function when an integer is printed', function(done) {
    doTest('arithmetics/02_printing-integer', done);
  });

  it('should evaluate when a negative integer is printed', function(done) {
    doTest('arithmetics/03_evaluate-negative', done);
  });
});