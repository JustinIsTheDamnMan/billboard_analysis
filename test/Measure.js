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
      
      measure = Measure.fromString(measureText, '3/4')
      measure.should.have.property('beats', 3) 

      measure = Measure.fromString(measureText, '6/8')
      measure.should.have.property('beats', 6) 
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

})

