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

  describe('Output', function() {
    it ('correctly builds a phraseString from internal properties', function() {
      let phraseString = 'C:1 . C:maj C:maj7 | C:5 | D:7 . . D:1(9,b11,3)/9 | ->'
      let songPhrase =
        SongPhrase.fromString( phraseString, '4/4', 'C' )

      songPhrase.toString().should.equal(
          'C:1 C:1 C:maj C:maj7 | C:5 C:5 C:5 C:5 | D:7 D:7 D:7 D:1(9,b11,3)/9')
    })

    it ('can output relative chords', function() {
      let phraseString = 'C:1 . C:maj C:maj7 | C:5 | D:7 . . B:1(9,b11,3)/9'
      let songPhrase =
        SongPhrase.fromString( phraseString, '4/4', 'C' )

      songPhrase.toRelativeString().should.equal(
          '1:1 1:1 1:maj 1:maj7 | 1:5 1:5 1:5 1:5 | 3:7 3:7 3:7 12:1(9,b11,3)/9')
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

  describe('Analysis', function() {
    it ('aggregates maj/min totals from measures')
  })
})

