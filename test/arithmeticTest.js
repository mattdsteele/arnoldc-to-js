(function() {
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
    //console.log(code);
    return code;
  }

  function doTest(pathPart, doneCallback) {
    var input = getCode(cwd + '/test/fixtures/' + pathPart + '.arnoldc');

    fs.readFile(cwd + '/test/fixtures/' + pathPart + '.js', fileOptions, function(err, expected) {
      if (err) {
        console.log('error with ' + pathPart, err);
      }

      /*jslint evil: true */
      assert.equal(eval(input), eval(expected));
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

    it('should evaluate when a boolean is printed', function(done) {
      doTest('arithmetics/04_evaluate-boolean', done);
    });

    it('should evaluate when a string is printed', function(done) {
      doTest('arithmetics/05_evaluate-string', done);
    });

    it('should evaluate when a string is printed', function(done) {
      doTest('arithmetics/06_evaluate-exotic-string', done);
    });

    it('should evaluate when an integer is declared and printed', function(done) {
      doTest('arithmetics/07_evaluate-integer', done);
    });

    it('should evaluate when a negative integer is declared and printed', function(done) {
      doTest('arithmetics/08_evaluate-negative-integer', done);
    });

    it('should evaluate when assigning a variable', function(done) {
      doTest('arithmetics/09_evaluate-assign', done);
    });

    it('should evaluate when assigning multiple variables', function(done) {
      doTest('arithmetics/10_evaluate-multiple-assign', done);
    });

    it('should evaluate when an integer is incremented and printed', function(done) {
      doTest('arithmetics/11_evaluate-integer-incremented', done);
    });

    it('should evaluate when an integer is decremented and printed', function(done) {
      doTest('arithmetics/12_evaluate-integer-decremented', done);
    });

    it('should evaluate when an integer is decremented with a negative value', function(done) {
      doTest('arithmetics/13_evaluate-integer-decremented-negative', done);
    });

    it('should evaluate when an integer is incremented with a negative value', function(done) {
      doTest('arithmetics/14_evaluate-integer-incremented-negative', done);
    });

    it('should evaluate when multiplying variables', function(done) {
      doTest('arithmetics/15_evaluate-multiply', done);
    });

    it('should evaluate when multiplying variables', function(done) {
      doTest('arithmetics/16_evaluate-multiply-signs', done);
    });

    it('should evaluate when multiplying variables', function(done) {
      doTest('arithmetics/17_evaluate-multiply-zero', done);
    });

    it('should evaluate when multiplying assigned variables', function(done) {
      doTest('arithmetics/18_evaluate-multiply-assign', done);
    });

    it('should evaluate when dividing variables', function(done) {
      doTest('arithmetics/19_evaluate-division', done);
    });

    it('should evaluate when dividing variables with different signs', function(done) {
      doTest('arithmetics/20_evaluate-division-signs', done);
    });

    it('should evaluate when dividing variables with one', function(done) {
      doTest('arithmetics/21_evaluate-division-one', done);
    });

    it('should evaluate when dividing assigned variables', function(done) {
      doTest('arithmetics/22_evaluate-division-assign', done);
    });

    it('should evaluate when calculating modulo variables vol1', function(done) {
      doTest('arithmetics/23_evaluate-module-vol1', done);
    });

    it('should evaluate when calculating modulo variables vol2', function(done) {
      doTest('arithmetics/24_evaluate-module-vol2', done);
    });

    it('should evaluate using different arithmetic operations vol1', function(done) {
      doTest('arithmetics/25_evaluate-operations-vol1', done);
    });


    it('should evaluate using different arithmetic operations vol2', function(done) {
      doTest('arithmetics/26_evaluate-operations-vol2', done);
    });


    it('should evaluate using different arithmetic operations vol3', function(done) {
      doTest('arithmetics/27_evaluate-operations-vol3', done);
    });

  });
})();