import _ from 'lodash'
import Note from '../src/Note'
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

    describe('Major / Minor identification', function() {
      it('Correctly identifies major chords', function() {
        let major = [
          "C:maj","C:maj6", "C:maj7", "C:maj9", "C:maj11", "C:maj13",
          "C:hdim7", "C:sus2", "C:sus4", "C:7", "C:9", "C:11", "C:13",
          "C:1(b5,b7,3)", "C:7(#11)/b3", "C:7(b9,#11)/b7"]

        _.map( major, function(x) {
          let chord = Chord.fromString( x )
          chord.should.have.property('isMajor', true)
          chord.should.have.property('isMinor', false)
        })
      })

      it('Correctly identifies minor chords', function() {
        let minor = [
          "C:min","C:min6", "C:min7", "C:min9", "C:min11", "C:min13",
          "C:dim","C:dim7", "C:minmaj", "C:minmaj7", 
          "C:1(b3,b7)/b7"]

        _.map( minor, function(x) {
          let chord = Chord.fromString( x )
          chord.should.have.property('isMajor', false)
          chord.should.have.property('isMinor', true)
        })
      })

      it('Correctly identifies non major/minor chords', function() {
        let nonMajorMinor = [
              "C:1","C:1(11)","C:1(11,9)","C:1(#5)",
              "C:5","C:5(b7)","C:5(13)","C:5(b7)/3",
              "N","&pause","1"]

        _.map( nonMajorMinor, function(x) {
          Chord.fromString(x).should.have.property('isMajor', false)
          Chord.fromString(x).should.have.property('isMinor', false)
        })
      })
    })

    describe('Output', function() {
      it('writes relative roots', function() {
        let chord = Chord.fromString("C:1(b5,b7,3)/b7")
        let relatives = [
               ["C","1"],
               ["B" ,"2"],
               ["Bb","3"],
               ["A#","3"],
               ["A" ,"4"],
               ["Ab","5"],
               ["G#","5"],
               ["G", "6"],
               ["Gb","7"],
               ["F#","7"],
               ["F", "8"],
               ["E", "9"],
               ["Eb","10"],
               ["D#","10"],
               ["D" ,"11"],
               ["Db","12"],
               ["C#","12"]]

        _.map( relatives, function(x) {
          chord.toRelativeString(Note.fromString(x[0])).should.equal(x[1]+":1(b5,b7,3)/b7")
          Chord.fromString('&pause').toRelativeString(x[0]).should.equal('&pause')
          Chord.fromString('N').toRelativeString(x[0]).should.equal('N')
          Chord.fromString('1').toRelativeString(x[0]).should.equal('/1')
        })
      })

      it ('writes "root+third+inversion" form', function() {
        let testCases = [
          // 1 & 5 shorthand indicates 'none'
          ['C:1',         '1:none/1'],
          ['C:1(#5)',     '1:none/1'],
          ['B:1',        '12:none/1'],
          ['C:5(b7)/b7',  '1:none/b7'],
          ['C:5(13)',     '1:none/1'],

          // 1 with b3 indicates 'minor'
          ['B:1(b3,b7,11,9)', '12:minor/1'],
          ['C:1(b3)',          '1:minor/1'],

          // 1 with 3 indicates 'major'
          ['B:1(b5,b7,3)', '12:major/1'],
          ['C:1(3,b7)',     '1:major/1'],

          // min, dim, & minmaj shorthand stems indicate 'minor'
          ['D:minmaj7/5',   '3:minor/5'],
          ['D:min9/11',     '3:minor/11'],
          ['D:min(11)/bb7', '3:minor/bb7'],
          ['C:dim/7',       '1:minor/7'],
          ['Ab:dim7/9',     '9:minor/9'],

          // maj, hdim, aug, sus, 7, 9, 11, 13 shorthand stems indicate 'major'
          ['C:7',          '1:major/1'],
          ['C#:7(#11)',    '2:major/1'],
          ['D:9',          '3:major/1'],
          ['Eb:11',        '4:major/1'],
          ['F:13',         '6:major/1'],
          ['C:maj',        '1:major/1'],
          ['C:maj7(9,11)', '1:major/1'],
          ['C:maj6(7)',    '1:major/1'],
          ['B:aug(b7)/3',  '12:major/3'],
          ['A:hdim7/b5',   '10:major/b5'],
          ['C:sus2/9',     '1:major/9'],
          ['D:sus4(b7,9)', '3:major/1']
        ]

        _.map( testCases, function( x ) {
          Chord.fromString( x[0] ).toRootThirdString( Note.fromString('C') )
            .should.equal( x[1] )
        })
      })

      it ('writes "max7+inversion" form', function() {
        let testCases = [
          ['C:1(#5)',     '1(#5)/1'],
          ['B:1(b3,b7,11,9)', '1(b3,b7)/1'],
          ['D:1(11,9)',   '1/1'],
          ['G:5(b7)/9',   '5(b7)/9'],
          ['F:7',         '7/1'],
          ['Gb:9',        '7/1'],
          ['A:11',        '7/1'],
          ['G:13',        '7/1'],
          ['G:7(b9)/11',  '7/11'],
          ['G:7(b9,b13)', '7/1'],
          ['C:maj/9',     'maj/9'],
          ['C:maj(9)/5',  'maj/5'],
          ['D#:maj6(7)',  'maj6/1'],
          ['D#:maj6(9)',  'maj6/1'],
          ['C:maj7(#11)', 'maj7/1'],
          ['C:maj9',      'maj7/1'],
          ['C:maj13',     'maj7/1'],
          ['D:min',       'min/1'],
          ['G:min(9)/7',  'min/7'],
          ['B:min/bb7',   'min/bb7'],
          ['F:min6(7)',   'min6/1'],
          ['G:min6/9',    'min6/9'],
          ['C:min7',      'min7/1'],
          ['C:min9',      'min7/1'],
          ['C:min11',     'min7/1'],
          ['C:min13',     'min7/1'],
          ['A:minmaj7/7', 'minmaj7/7'],
          ['G:sus2(b7)',  'sus2(b7)/1'],
          ['F:sus2(#11)', 'sus2/1'],
          ['Bb:sus4(b7,9,13)/11', 'sus4(b7)/11'],
          ['B:hdim7/11',  'hdim7/11'],
          ['G:dim(b13)',  'dim/1'],
          ['G#:dim7/9',   'dim7/9'],
          ['B:aug(b7)/3', 'aug(b7)/3']
        ]

        _.map( testCases, function( x ) {
          Chord.fromString( x[0] )
            .toMaxSeventhString( Note.fromString( 'C' ) )
            .should.equal( x[1] )
        })

      })

      it ('writes "goal+inversion" form', function() {
        let testCases = [
          ['C:1(#5)',     '1:1(#5)/1'],
          ['B:1(b3,b7,11,9)', '12:1(b3,b7)/1'],
          ['D:1(11,9)',   '3:1/1'],
          ['G:5(b7)/9',   '8:5(b7)/9'],
          ['F:7',         '6:7/1'],
          ['Gb:9',        '7:7/1'],
          ['A:11',        '10:7/1'],
          ['G:13',        '8:7/1'],
          ['G:7(b9)/11',  '8:7/11'],
          ['G:7(b9,b13)', '8:7/1'],
          ['C:maj/9',     '1:maj/9'],
          ['C:maj(9)/5',  '1:maj/5'],
          ['D#:maj6(7)',  '4:maj6/1'],
          ['D#:maj6(9)',  '4:maj6/1'],
          ['C:maj7(#11)', '1:maj7/1'],
          ['C:maj9',      '1:maj7/1'],
          ['C:maj13',     '1:maj7/1'],
          ['D:min',       '3:min/1'],
          ['G:min(9)/7',  '8:min/7'],
          ['B:min/bb7',   '12:min/bb7'],
          ['F:min6(7)',   '6:min6/1'],
          ['G:min6/9',    '8:min6/9'],
          ['C:min7',      '1:min7/1'],
          ['C:min9',      '1:min7/1'],
          ['C:min11',     '1:min7/1'],
          ['C:min13',     '1:min7/1'],
          ['A:minmaj7/7', '10:minmaj7/7'],
          ['G:sus2(b7)',  '8:sus2(b7)/1'],
          ['F:sus2(#11)', '6:sus2/1'],
          ['Bb:sus4(b7,9,13)/11', '11:sus4(b7)/11'],
          ['B:hdim7/11',  '12:hdim7/11'],
          ['G:dim(b13)',  '8:dim/1'],
          ['G#:dim7/9',   '9:dim7/9'],
          ['B:aug(b7)/3', '12:aug(b7)/3']
        ]

        _.map( testCases, function( x ) {
          Chord.fromString( x[0] )
            .toGoalInversionString( Note.fromString( 'C' ) )
            .should.equal( x[1] )
        })
      })
    })
  })
})
