import _ from 'lodash'
import Chord from '../src/Chord'

const chai = require('chai')
chai.use( require('chai-subset') )
chai.should()

describe('Chord', function() {
  describe('Parsing from string', function() {

    describe('Basic forms', function() {
      it('should correctly handle unadorned roots', function() {
        Chord.fromString( "Ab" )
          .should.containSubset({ 
            raw: "Ab", 
            root: { raw: "Ab" },
            components: null,
            bass: null 
          })
      })

      it('should correctly handle "<note>/<degree>"', function() {
        Chord.fromString( "G#/b3" )
          .should.containSubset({ 
            raw: "G#/b3", 
            root: { raw: "G#" },
            components: null, 
            bass: { raw: "b3" }
          })
      })
    })

    describe('Shorthand forms', function() {
      it('should correctly handle "<note>:shorthand"', function() {
        Chord.fromString( "Db:minmaj7" )
          .should.containSubset({
            raw: "Db:minmaj7",
            root: { raw: "Db" },
            components: { raw: "minmaj7" },
            bass: null
          })
      })

      it('should correctly handle "<note>:<shorthand>/degree"', function() {
        Chord.fromString( "C:sus2/#11" )
          .should.containSubset({ 
            raw: "C:sus2/#11", 
            root: { raw: "C" },
            components: { raw: "sus2" }, 
            bass: { raw: "#11" }
          })
      })
    })

    describe('Degree-list forms', function() {
      it('should correctly handle "<note>:(<degree-list>)"', function() {
        Chord.fromString( "F#:(3,#12)" )
          .should.containSubset({
            raw: "F#:(3,#12)",
            root: { raw: "F#" },
            components: { raw: "(3,#12)" },
            bass: null
          })
      })

      it('should correctly handle "<note>:(<degree-list>)/<degree>"', function() {
        Chord.fromString( "B:(12)/11" )
          .should.containSubset({
            raw: "B:(12)/11",
            root: { raw: "B" },
            components: { raw: "(12)" },
            bass: { raw: "11" }
          })
      })

      it('should correctly handle "<note>:shorthand(<degree-list>)"', function() {
        Chord.fromString( "Bb:maj7(*3,b9,11)" )
          .should.containSubset({
            raw: "Bb:maj7(*3,b9,11)",
            root: { raw: "Bb" },
            components: { raw: "maj7(*3,b9,11)" },
            bass: null
          })
      })
      
      it('should correctly handle "<note>:shorthand(<degree-list>)/<degree>"', function() {
        Chord.fromString( "A:min11(*b11,13)/b2" )
          .should.containSubset({
            raw: "A:min11(*b11,13)/b2",
            root: { raw: "A" },
            components: { raw: "min11(*b11,13)" },
            bass: { raw: "b2" }
          })
      })
    })

    describe('Special forms', function() {
      it('should correctly handle "&pause"', function() {
        Chord.fromString( "&pause" )
          .should.containSubset({
            raw: "&pause",
            root: null,
            components: null,
            bass: null,
            isPause: true
          })
      })

      it('should correctly handle "N"', function() {
        Chord.fromString( "N" )
          .should.containSubset({
            raw: "N",
            root: null,
            components: null,
            bass: null,
            isUnknown: true
          })
      })

      it('should correctly handle "1"', function() {
        Chord.fromString( "1" )
          .should.containSubset({
            raw: "1",
            root: null,
            components: null,
            bass: { raw: "1" }
          })
      })
    })
  })
})
