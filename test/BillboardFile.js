import _ from 'lodash'
import BillboardFile from '../src/BillboardFile'

const chai = require('chai')
chai.use( require('chai-subset') )
chai.should()

describe('BillboardFile', function() {
  describe('#constructor()', function() {
    let billboardFile = {}
    const TEST_FILEPATH = 'source_data/McGill-Billboard/0021/salami_chords.txt' 

    before( function() {
      billboardFile = new BillboardFile(TEST_FILEPATH)
    })

    it('should store filepath', function () {
      billboardFile.filepath.should.equal(TEST_FILEPATH);
    })

    it('should store the title and artist', function() {
      billboardFile.should.containSubset({
        title: 'Just Can\'t Wait',
        artist: 'The J. Geils Band'
      })
    })
    
    it('should provide a list of correctly named and annotated sections', function() {
      billboardFile.should.have.property('sections');
      billboardFile.sections.should.containSubset([
          { type: 'silence' },
          { label: 'A', type: 'intro', metre: '4/4', tonic: 'G' },
          { label: 'B', type: 'verse' , metre: '4/4', tonic: 'G' },
          { label: 'A', type: 'chorus' , metre: '4/4', tonic: 'G' },
          { label: 'B', type: 'verse' , metre: '4/4', tonic: 'G' },
          { label: 'A', type: 'chorus' , metre: '4/4', tonic: 'G' },
          { label: 'C', type: 'bridge' , metre: '4/4', tonic: 'G' },
          { label: 'A', type: 'solo' , metre: '4/4', tonic: 'G' },
          { label: 'B\'', type: 'verse' , metre: '4/4', tonic: 'G' },
          { label: 'A', type: 'chorus' , metre: '4/4', tonic: 'G' },
          { label: 'A\'', type: 'coda' , metre: '4/4', tonic: 'G' },
          { type: 'silence' },
          { type: 'end' }
      ])
    })

    it('should correctly associate phrases to sections', function() {
      billboardFile.sections.should.containSubset([
          { type: 'silence' },
          { label: 'A', phrases: [ { time: '0.30185941' }, 
                                   { time: '6.665238095' }, 
                                   { time: '12.933151927' },
                                   { time: '19.281927437' } ] },
          { label: 'B', phrases: [ { time: '25.584920634' },
                                   { time: '31.881655328' },
                                   { time: '38.176077097' },
                                   { time: '44.515328798' } ] }
      ]);
    })
  })

  describe('+parseHashLine()', function() {
    it('should correctly parse a hash line', function() {
      let hashline = "# title: I'm still wearing (the same shoes)";
      let result = BillboardFile.parseHashLine( hashline );

      result.should.have.property('title', "I'm still wearing (the same shoes)");
      result.should.have.property('linetype', 'annotation');
    })
  })

  describe('+parseLine()', function() {
    it('should capture timing for each line', function() {
      let filetext = `
0.0	silence
7.3469387e-2	A, intro, | A:min | A:min | C:maj | C:maj |
8.714013605	| A:min | A:min | C:maj | C:maj |
15.611995464	| A:min | A:min | C:maj | C:maj |
22.346394557	B, verse, | A:min | A:min | C:maj | C:maj |, (voice
29.219433106	| A:min | A:min | C:maj | C:maj |`;

      let results = _.compact(
                      _.map(filetext.split('\n'), 
                        line => BillboardFile.parseLine( line )));

      results.should.have.lengthOf(6);
      results[0].should.have.property('timing','0.0');
      results[1].should.have.property('timing','7.3469387e-2');
      results[2].should.have.property('timing','8.714013605');
      results[3].should.have.property('timing','15.611995464');
      results[4].should.have.property('timing','22.346394557');
      results[5].should.have.property('timing','29.219433106');
    })
  
    it('should capture section labels and types', function() {
      let filetext = `
0.0	silence
7.3469387e-2	A, | A:min | A:min | C:maj | C:maj |
8.714013605	| A:min | A:min | C:maj | C:maj |
15.611995464	fadeout, | A:min | A:min | C:maj | C:maj |
22.346394557	B'', verse, | A:min | A:min | C:maj | C:maj |, (voice
29.219433106	| A:min | A:min | C:maj | C:maj |`;

      let results = _.compact(
                      _.map(filetext.split('\n'),
                        line => BillboardFile.parseLine( line )));

      results.should.have.lengthOf(6);

      results[1].should.have.property('linetype','phrase');
      results[1].should.have.property('section');
      results[1].section.should.have.property('label', 'A');
      results[1].section.should.not.have.property('type');

      results[3].should.have.property('linetype','phrase');
      results[3].should.have.property('section');
      results[3].section.should.not.have.property('label');
      results[3].section.should.have.property('type', 'fadeout');

      results[4].should.have.property('linetype','phrase');
      results[4].should.have.property('section');
      results[4].section.should.have.property('label', "B''");
      results[4].section.should.have.property('type', 'verse');

      results[0].should.not.have.property('section');
      results[2].should.not.have.property('section');
      results[5].should.not.have.property('section');
    })

    it('should capture and extract events for each phrase', function() {
      let filetext = `0.000000000	silence
0.255419501	A, intro, | Ab:maj | Db:maj/5 | Ab:maj | G:hdim7 C:7 |, (synth)
14.013514739	B, verse, | F:min | C:7/5 C:7 | F:min C:7/5 | F:min/b3 C:7/5 F:min . |, (voice
25.853922902	| Bb:min7 | Eb:7 | Ab:maj | Ab:maj |
37.546666666	C, pre-chorus, | G:hdim7 | C:7 | F:min C:7/5 | F:min/b3 C:7/5 F:min . |
49.184761904	| Bb:min7 | C:min7 | Eb:11 | Eb:maj |
60.961020408	D, chorus, | Ab:maj | Ab:7 | Db:maj | Db:maj |
72.560770975	| Ab:maj | Ab:maj | Eb:7 | Eb:7 |
84.028004535	| Ab:maj | Ab:maj7 | Db:maj | Gb:maj Db:maj . . |
95.393854875	| Db:maj7 C:min7 | Bb:min7 | Ab:maj |
103.635941043	E, bridge, | Gb:maj(9) | Db:maj | Ab:maj | Ab:maj |
114.834331065	| Db:maj | Gb:7 | F:min7 | Bb:min7 | Eb:11 | Eb:maj |
131.200000000	C, chorus, | Ab:maj | Ab:7 | Db:maj | Db:maj |
142.793265306	| Ab:maj | Ab:maj | Eb:7 | Eb:7 |
153.905238095	| Ab:maj | Ab:maj7 | Db:maj | Gb:maj Db:maj . . |
164.970136054	| Db:maj7 C:min7 | Bb:min7 | ->
170.329773242	F, outro, | Ab:maj | Db:maj/5 |
175.945396825	| Ab:maj | Db:maj/5 |
181.297392290	| Ab:maj | Db:maj/5 |
186.794897959	| Ab:maj | Db:maj/5 |
192.145192743	fadeout, | Ab:maj | Db:maj/5 |
197.540045351	| Ab:maj | Db:maj/5 |, voice)
202.321473922	silence
206.540272108	end`;

      let results = _.compact(
                      _.map(filetext.split('\n'),
                        line => BillboardFile.parseLine( line )));

      results.should.have.lengthOf(24);
      results[0].should.not.have.property('rawPhrase');
      results[0].should.not.have.property('annotation');

      results[1].should.have.property(
          'rawPhrase',
          '| Ab:maj | Db:maj/5 | Ab:maj | G:hdim7 C:7 |')
      results[1].should.have.property('annotation','(synth)')

      results[2].should.have.property(
          'rawPhrase',
          '| F:min | C:7/5 C:7 | F:min C:7/5 | F:min/b3 C:7/5 F:min . |')
      results[2].should.have.property('annotation','(voice')

      results[8].should.have.property(
          'rawPhrase',
          '| Ab:maj | Ab:maj7 | Db:maj | Gb:maj Db:maj . . |')
      results[8].should.not.have.property('annotation')

      results[15].should.have.property(
          'rawPhrase',
          '| Db:maj7 C:min7 | Bb:min7 | ->')
      results[15].should.not.have.property('annotation')
    })

    it("marks sections labeled as 'Z' as 'non-musical'", function() {
      let result = BillboardFile.parseLine( '123.456 Z' )
      result.should.have.property('linetype','non-musical')
      result.should.have.property('section')
      result.section.should.have.property('label','Z')
      result.section.should.not.have.property('type')

      result = BillboardFile.parseLine('4.4e-2 Z, noise')
      result.should.have.property('linetype','non-musical')
      result.should.have.property('section')
      result.section.should.have.property('label','Z')
      result.section.should.have.property('type','noise')

      result = BillboardFile.parseLine('146.866  Z\'\', talking')
      result.should.have.property('linetype','non-musical')
      result.should.have.property('section')
      result.section.should.have.property('label','Z\'\'')
      result.section.should.have.property('type','talking')
    })
  })
})

