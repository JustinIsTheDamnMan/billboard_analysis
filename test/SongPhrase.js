import _ from 'lodash'
import SongPhrase from '../src/SongPhrase'

const chai = require('chai')
chai.use( require('chai-subset') )
chai.should()

describe('SongPhrase', function() {
  describe('basic creation', function() {
    it ('accepts and stores raw, metre, tonic, and timing values', function() {
      let phraseString = 'C:1 | C:maj | C:min | C:5'
      let songPhrase = 
        SongPhrase.fromString( phraseString, '4/4', 'C', '30.5' )

      songPhrase.should.containSubset({
        timing: '30.5',
        metre: '4/4',
        tonic: 'C',
        raw: phraseString })
    })

    it ('stores Measures in array', function() {
      let phraseString = 'C:1 | C:maj | C:min | C:5'
      let songPhrase =
        SongPhrase.fromString( phraseString, '4/4', 'C' )

      songPhrase.should.containSubset({
        measures: [{ raw: 'C:1' }, { raw: 'C:maj' }, { raw: 'C:min' }, { raw: 'C:5' }]
      })
    })

    it ('correctly parses "x8"-style repetition annotation', function() {
      let phraseString = 'C:1 | C:maj | C:min | C:5 | x11 '
      let songPhrase = 
        SongPhrase.fromString( phraseString, '4/4', 'C' )

      songPhrase.should.containSubset({
        nRepeat: 11,
        measures: [{ raw: 'C:1' }, { raw: 'C:maj' }, { raw: 'C:min' }, { raw: 'C:5' }]
      })
    })

    it ('correctly parses "->" elision annotation', function() {
      let phraseString = 'C:1 | C:maj | C:min | C:5 | -> '
      let songPhrase = 
        SongPhrase.fromString( phraseString, '4/4', 'C' )

      songPhrase.should.containSubset({
        hasElision: true,
        measures: [{ raw: 'C:1' }, { raw: 'C:maj' }, { raw: 'C:min' }, { raw: 'C:5' }]
      })
    })
  })

  describe('writer', function() {
    it ('correctly writes a phrase based on internal properties', function() {
      let test = 'C:1 . C:maj C:maj7 | C:5 | D:7 . . D:1(9,b11,3)/9 | ->'
      let expected = 'C:1 C:1 C:maj C:maj7 | C:5 C:5 C:5 C:5 | D:7 D:7 D:7 D:1(9,b11,3)/9'

      SongPhrase.fromString( test, '4/4', 'C' )
        .toString().should.equal( expected )
    })

    it ('can output relative chords', function() {
      let test = 'C:1 . C:maj C:maj7 | C:5 | D:7 . . B:1(9,b11,3)/9'
      let expected = '1:1 1:1 1:maj 1:maj7 | 1:5 1:5 1:5 1:5 | 3:7 3:7 3:7 12:1(9,b11,3)/9'

      SongPhrase.fromString( test, '4/4', 'C' )
        .toRelativeString().should.equal( expected )
    })

    it ('can output "root+third+inversion"', function() { 
      let phraseString = 'C:1 . C:maj C:maj7 | C:5 | D:7 . . B:1(9,b11,3)/9'
      let songPhrase =
        SongPhrase.fromString( phraseString, '4/4', 'C' )

      songPhrase.toRootThirdString().should.equal(
          '1:none/1 1:none/1 1:major/1 1:major/1 | 1:none/1 1:none/1 1:none/1 1:none/1 | 3:major/1 3:major/1 3:major/1 12:major/9')
    })

    it ('can output "max7+inversion" chords', function() {
      let phraseString = 'C:1 . C:maj C:maj7 | C:5 | D:7 . . B:1(9,b11,3)/9'
      let songPhrase =
        SongPhrase.fromString( phraseString, '4/4', 'C' )

      songPhrase.toMaxSeventhString().should.equal(
          '1/1 1/1 maj/1 maj7/1 | 5/1 5/1 5/1 5/1 | 7/1 7/1 7/1 1(3)/9')
    })

    it ('can output "goal+inversion" chords', function() {
      let phraseString = 'C:1 . C:maj C:maj7 | C:5 | D:7 . . B:1(9,b11,3)/9'
      let songPhrase =
        SongPhrase.fromString( phraseString, '4/4', 'C' )

      songPhrase.toGoalInversionString().should.equal(
          '1:1/1 1:1/1 1:maj/1 1:maj7/1 | 1:5/1 1:5/1 1:5/1 1:5/1 | 3:7/1 3:7/1 3:7/1 12:1(3)/9')
    })
    it ('can include phrase annotations in output')
    it ('can exclude phrase annotations in output')
  })

  describe('analyses', function() {
    it ('aggregate maj/min totals from measures', function() {

      let phraseString = 
        'C:1 . C:maj C:maj7 | C:5 | C:min6 . . B:1(9,b11,3)/9'

      let songPhrase =
        SongPhrase.fromString( phraseString, '4/4', 'C' )

      songPhrase.should.have.property('majMinScore', -1)
    })

    describe('the measure count', function() {
      let tonic = 'C'
      let metre = '4/4'

      let testCases = [
        ["C | C . | C D E .", 3],
        ["C", 1],
        ["  ", 0],
        ["C#:sus4(b7,9) C#:7 | F#:min7 . B:sus4(b7) B:7 | E:maj A:maj | D:maj7 D:maj6 | D:maj6", 5] 
      ]       

      testCases.map( function( testCase) {
        it(`for "${ testCase[0] }" as ${ testCase[1] }`, function() {
          SongPhrase.fromString( testCase[0], metre, tonic ).measures
            .should.have.property('length', testCase[1])
        })
      })
    })
  })
})

