import _ from 'lodash'
import Measure from '../src/Measure'

const chai = require('chai')
chai.use( require('chai-subset') )
chai.should()

describe('Measure', function() {

  describe('Basic structure', function() {
    it('Keeps raw version of input', function() {
      let measureText = 'D:maj G:maj G:maj/5 D:maj'
      Measure.fromString(measureText)
        .should.have.property('raw', measureText)
    })

    it('Does not fill beats for raw version', function() {
      let measureText = 'D:maj G:maj'
      Measure.fromString(measureText,'4/4')
        .should.have.property('raw', measureText)
    })

    it('Extracts beats from metre', function() {

      let measureText = 'D:maj . G:maj/5 D:maj'
      let measure = Measure.fromString(measureText, '4/4')
      measure.should.have.property('beats', 4)
      measure.should.have.property('beatValue', 4)

      measure = Measure.fromString(measureText, '3/4')
      measure.should.have.property('beats', 3) 
      measure.should.have.property('beatValue', 4)

      measure = Measure.fromString(measureText, '6/8')
      measure.should.have.property('beats', 6) 
      measure.should.have.property('beatValue', 8)
    })

    it('Creates chord sequence from provided input', function() {
      let measureText = 'D:maj C:maj G:maj/5 D:maj'
      let measure = Measure.fromString(measureText, '4/4')

      measure.should.containSubset({ chords: [
        { raw: 'D:maj', root: { natural: 'D', modifier: null }, components: { raw: 'maj' }, bass: null },
        { raw: 'C:maj', root: { natural: 'C', modifier: null }, components: { raw: 'maj' }, bass: null },
        { raw: 'G:maj/5', root: { natural: 'G', modifier: null }, components: { raw: 'maj' }, bass: { raw: '5' }},
        { raw: 'D:maj', root: { natural: 'D', modifier: null }, components: { raw: 'maj' }, bass: null }]})
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

  describe('Statistics', function() {
    it('provides count of major and minor chords in a measure', function() {
      let measure = Measure.fromString( 'D:maj', '4/4', 'D' )
      measure.should.have.property('nMajor', 4, JSON.stringify( measure ))

      measure = Measure.fromString( 'C:hdim7 E:5 G:1(9,11,b3)', '6/8', 'C' )
      measure.should.have.property('nMajor', 2, JSON.stringify( measure ))
      measure.should.have.property('nMinor', 2, JSON.stringify( measure ))
    })
  })

  describe('Special notation', function() {
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
        nMajor: 0,
        nMinor: 0,
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
})

