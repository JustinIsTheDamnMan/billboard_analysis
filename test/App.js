const chai = require('chai')
chai.use( require('chai-subset') )
chai.should()

describe('The billboard-analysis app', function() {
  it('reads a single billboard file when provided a full filepath');
  it('reads a "billboard directory" of files when provided');
  it('augments song metadata when provided a metadata file');
})
