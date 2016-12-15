import _ from 'lodash'
import Note from '../src/Note'

const chai = require('chai')
chai.use( require('chai-subset') )
chai.should()

describe('Note', function() {
  describe('Parsing from a string', function() {
    describe('Chromatic scale', function() {
      it('A', function(){
        Note.fromString('A')
          .should.containSubset({
            raw: 'A',
            natural: 'A',
            modifier: null
          })
      })
      it('A#', function(){
        Note.fromString('A#')
          .should.containSubset({
            raw: 'A#',
            natural: 'A',
            modifier: '#' 
          })
      })
      it('Ab', function(){
        Note.fromString('Ab')
          .should.containSubset({
            raw: 'Ab',
            natural: 'A',
            modifier: 'b' 
          })
      })
      it('B', function(){
        Note.fromString('B')
          .should.containSubset({
            raw: 'B',
            natural: 'B',
            modifier: null 
          })
      })
      it('Bb', function(){
        Note.fromString('Bb')
          .should.containSubset({
            raw: 'Bb',
            natural: 'B',
            modifier: 'b' 
          })
      })
      it('C', function(){
        Note.fromString('C')
          .should.containSubset({
            raw: 'C',
            natural: 'C',
            modifier: null 
          })
      })
      it('C#', function(){
        Note.fromString('C#')
          .should.containSubset({
            raw: 'C#',
            natural: 'C',
            modifier: '#' 
          })
      })
      it('D', function(){
        Note.fromString('D')
          .should.containSubset({
            raw: 'D',
            natural: 'D',
            modifier: null 
          })
      })
      it('D#', function(){
        Note.fromString('D#')
          .should.containSubset({
            raw: 'D#',
            natural: 'D',
            modifier: '#' 
          })
      })
      it('Db', function(){
        Note.fromString('Db')
          .should.containSubset({
            raw: 'Db',
            natural: 'D',
            modifier: 'b' 
          })
      })
      it('E', function(){
        Note.fromString('E')
          .should.containSubset({
            raw: 'E',
            natural: 'E',
            modifier: null 
          })
      })
      it('Eb', function(){
        Note.fromString('Eb')
          .should.containSubset({
            raw: 'Eb',
            natural: 'E',
            modifier: 'b' 
          })
      })
      it('F', function(){
        Note.fromString('F')
          .should.containSubset({
            raw: 'F',
            natural: 'F',
            modifier: null
          })
      })
      it('F#', function(){
        Note.fromString('F#')
          .should.containSubset({
            raw: 'F#',
            natural: 'F',
            modifier: '#' 
          })
      })
      it('G', function(){
        Note.fromString('G')
          .should.containSubset({
            raw: 'G',
            natural: 'G',
            modifier: null 
          })
      })
      it('Gb', function(){
        Note.fromString('Gb')
          .should.containSubset({
            raw: 'Gb',
            natural: 'G',
            modifier: 'b' 
          })
      })
      it('G#', function(){
        Note.fromString('G#')
          .should.containSubset({
            raw: 'G#',
            natural: 'G',
            modifier: '#' 
          })
      })
    })

    describe('Interval measurements', function() {
      it('should correctly identify equivalent notes', function() {

        let equivalentNoteStrings = [
              ['C#','Db'],['D#','Eb'],['F#','Gb'],['G#','Ab'],['A#','Bb']]

        let equivalentNotes = _.map(equivalentNoteStrings,
                                      x => [ Note.fromString( x[0] ),
                                             Note.fromString( x[1] ) ])
          
        for ( var notePair of equivalentNotes ) {

          Note.intervalLength( notePair[0], notePair[1] )
            .should.equal(0)

          Note.areEquivalent( notePair[0], notePair[1] ) 
            .should.be.true

          notePair[0].isEquivalentTo( notePair[1] )
            .should.be.true

          notePair[1].isEquivalentTo( notePair[0] )
            .should.be.true
        }
      })
    })
  })
})
