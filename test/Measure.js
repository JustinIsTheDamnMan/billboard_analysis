import _ from 'lodash'
import Measure from '../src/Measure'
import Note from '../src/Note'
const chai = require('chai')
chai.use( require('chai-subset') )
chai.should()

describe('The Measure', function() {
  describe('parser', function() {

    it('should retain raw input', function() {
      let measureText = 'D:maj G:maj G:maj/5 D:maj'
      Measure.fromString(measureText)
        .should.have.property('raw', measureText)
    })

    it('should not fill beats for raw output', function() {
      let measureText = 'D:maj G:maj'
      Measure.fromString(measureText,'4/4')
        .should.have.property('raw', measureText)
    })

    describe('should extract "beats" and "beatValue" from metre annotations: ', function() {

      let measureText = 'D:maj . G:maj/5 D:maj'
      let testCases = [
        ['4/4', 4, 4],
        ['3/4', 3, 4],
        ['6/8', 6, 8],
        ['12/4', 12, 4]
      ]
      
      _.map( testCases, function( testCase ) {
        it( `"${ testCase[0] }" => `
          + ` { beats: ${ testCase[1] }, beatValue: ${ testCase[2] } }`, function() {

          Measure.fromString( measureText, testCase[0] )
            .should.containSubset( { beats: testCase[1], beatValue: testCase[2] } )
        })
      })
    })

    it('creates chord sequence from provided input', function() {
      let measureText = 'D:maj C:maj G:maj/5 D:maj'
      let measure = Measure.fromString(measureText, '4/4')

      measure.should.containSubset({ chords: [
        { raw: 'D:maj', root: { natural: 'D', modifier: null }, components: { raw: 'maj' }, bass: null },
        { raw: 'C:maj', root: { natural: 'C', modifier: null }, components: { raw: 'maj' }, bass: null },
        { raw: 'G:maj/5', root: { natural: 'G', modifier: null }, components: { raw: 'maj' }, bass: { raw: '5' }},
        { raw: 'D:maj', root: { natural: 'D', modifier: null }, components: { raw: 'maj' }, bass: null }]})
    })

    it('handles "*" notation for musically complex measures', function() {
      
      // In this case, the measure considered to be too complex for 
      // assigning chords to beats.  Chord content, time signature content,
      // etc. is left null. 'isComplex' is marked as true.

      let measure = Measure.fromString( '*' )

      measure.should.containSubset({
        raw: '*',
        beats: null,
        beatsOverride: null,
        beatValue: null,
        beatValueOverride: null,
        tonic: null,
        chords: null,
        majMinScore: 0,
        isInvalid: false,
        error: null,
        isComplex: true
      })
    })

    it('handles in-line time signature changes', function() {
      
      // In this case, we ignore the time signature provided as the 2nd arg
      // in favor of the embedded signature.  This removes the need for
      // routines to understand and lookout for embedded signatures.

      let measure = Measure.fromString( '(6/4) C:maj A:maj D:maj', '4/4', 'C' )
      
      measure.should.containSubset({ 
        beats: 4,
        beatValue: 4,
        beatsOverride: 6,
        beatValueOverride: 4,
        chords: [
          { raw: 'C:maj' },
          { raw: 'C:maj' },
          { raw: 'A:maj' },
          { raw: 'A:maj' },
          { raw: 'D:maj' },
          { raw: 'D:maj' }]
      })
    })
  })

  describe('Dot notation', function() {
    it('Duplicates previous chord when a dot is encountered', function() {
      let measureText = 'D:maj . G:maj/5 D:maj'
      let measure = Measure.fromString(measureText, '4/4')

      measure.should.containSubset({ chords: [
        { raw: 'D:maj', root: { natural: 'D', modifier: null }, components: { raw: 'maj' }, bass: null },
        { raw: 'D:maj', root: { natural: 'D', modifier: null }, components: { raw: 'maj' }, bass: null },
        { raw: 'G:maj/5', root: { natural: 'G', modifier: null }, components: { raw: 'maj' }, bass: { raw: '5' }},
        { raw: 'D:maj', root: { natural: 'D', modifier: null }, components: { raw: 'maj' }, bass: null }]})
    })

    it ('Does not process dots in raw output', function() {
      let measureText = 'D:maj . G:maj/5 D:maj'
      let measure = Measure.fromString(measureText, '4/4')
                      .should.have.property('raw', measureText)
    })
  })

  describe('Beat filling', function() {
    it ('Can generate beat-filled measure when provided 1 chord', function() {
      let measureText = 'G:maj/5'
      let measure = Measure.fromString(measureText, '6/8', 'G')

      measure.should.containSubset({ chords: [
        { raw: 'G:maj/5' },
        { raw: 'G:maj/5' },
        { raw: 'G:maj/5' },
        { raw: 'G:maj/5' },
        { raw: 'G:maj/5' },
        { raw: 'G:maj/5' }]})
    })

    it ('Can generate beat-filled measure when provided 2 chords', function() {
      let measureText = 'D:maj .'
      let measure = Measure.fromString( measureText, '4/4', 'D')

      measure.should.containSubset({ chords: [
        { raw: 'D:maj'},
        { raw: 'D:maj'},
        { raw: 'D:maj'},
        { raw: 'D:maj'}]})

      measure = Measure.fromString( 'D:maj C:maj', '6/8', 'D' )

      measure.should.containSubset({ chords: [
        { raw: 'D:maj' },
        { raw: 'D:maj' },
        { raw: 'D:maj' },
        { raw: 'C:maj' },
        { raw: 'C:maj' },
        { raw: 'C:maj' }
      ]})
    })

    it ('Can generate beat-filled measure when provided 3 of 6 chords', function() {
      let measure = Measure.fromString( 'D:maj C:maj 1/7', '6/8', 'D' )

      measure.should.containSubset({ chords: [
        { raw: 'D:maj' },
        { raw: 'D:maj' },
        { raw: 'C:maj' },
        { raw: 'C:maj' },
        { raw: '1/7' },
        { raw: '1/7' }
      ]})
    })

    it ('Detects error in other cases', function() {
      let measure = Measure.fromString( 'D:maj C:maj', '5/8', 'D')
      measure.should.have.property('isInvalid', true)
      measure.should.have.property('error')

      measure = Measure.fromString( 'D:maj C:maj', '3/4', 'D')
      measure.should.have.property('isInvalid', true)
      measure.should.have.property('error')
    })
  })

  describe('calculates', function() {
    describe('the maj_min score', function() {

      let tonic = 'C'
      let metre = '4/4'

      let testCases = [
        ['D:maj', 0],
        ['D:min', 0],
        ['C:maj', 4],
        ['C:min', -4],
        ['C:5', 0],
        ['C:maj .', 4],
        ['C:min .', -4],
        ['C:maj C:min', 0],
        ['C:maj . . C:min', 2],
        ['C:maj C:min . .', -2],
        ['(6/8) C:hdim7 E:5 C:1(9,11,b3)', 0]
      ]

      _.map( testCases, function( testCase ) {
        it( `for measure "${ testCase[0] }" with tonic ${ tonic.toString() } `
          + `and prevailing metre ${ metre } as ${ testCase[1] }`, function() {

          Measure.fromString( testCase[0], metre, tonic )
            .should.have.property( 'majMinScore', testCase[1] )
        })
      })
    })
  })
})

