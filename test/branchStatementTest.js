import { doTest } from './utils.js';

describe('branches', function() {
    it('should function with an if statement', function(done) {
      doTest('branches/01_if-statement', done);
    });
    it('should function with if and else statements', function(done) {
      doTest('branches/02_if-else-statements', done);
    });
    it('should function with if, if else, and else statements', function(done) {
      doTest('branches/03_if-elseif-else-statements', done);
    });
    it('should function with if and else statements with variable expressions', function(done) {
      doTest('branches/04_if-else-statements-with-variable-expressions', done);
    });
});