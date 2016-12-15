import _ from 'lodash'
import Chord from './Chord'
import Note from './Note'

class Measure {
  constructor() {
    this.raw = null
    this.beats = null
    this.tonic = null
    this.chords = null
    this.isInvalid = false
    this.error = null
  }

  static fromString( rawString, metre, tonic ) {
    let result = new Measure()
    result.raw = rawString.trim()

    if (! metre ) {
      result.isInvalid = true
      result.error = "No metre provided."
    }
    else {
      let metreParts =  /([0-9]+)\/[0-9]+/.exec( metre )
      if (! metreParts) {
        result.isInvalid = true
        result.error = "Cannot parse metre: " + metre
      }

      result.beats = parseInt( metreParts[1] )
    }
   
    if (! tonic ) {
      result.isInvalid = true
      result.error = "No tonic provided."
    }
    else {
      result.tonic = Note.fromString( tonic )
      if (! result.tonic ) {
        result.isInvalid = true
        result.error = "Could not create note from tonic: " + tonic
      }
    }

    result.chords = []

    let rawChords = result.raw.split(' ')
    let lastChord = null
    for (var rawChord of rawChords) {
      if (rawChord === '.') 
        rawChord = lastChord

      lastChord = rawChord
      result.chords.push( Chord.fromString( rawChord ) )
    } 

    if ( result.beats && result.beats > result.chords.length ) {
      if ( result.beats % result.chords.length === 0 ) {
        result.chords = _.concat( 
                          _.flatten(
                            _.map( result.chords, 
                                   chord => _.times( result.beats / result.chords.length, 
                                                     _.wrap( chord, _.cloneDeep ) ) ) ) )
      }
      else {
        result.isInvalid = true
        result.error = "Could not expand " + result.chords.length + " chords to " + result.beats + " beats."
      }
    }

    return result
  }
}

export default Measure

