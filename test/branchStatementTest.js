import { doTest } from './utils.js';

describe('branches', function() {
    it('should function with an if statement', function(done) {
      doTest('branches/01_if-statement', done);
    });
    it('should function with if and else statements', function(done) {
      doTest('branches/02_if-else-statements', done);
    });
});