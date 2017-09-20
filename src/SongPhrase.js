const _ = require('lodash')
const Measure = require('./Measure')

module.exports = 
class SongPhrase {
  constructor() {
    this.timing = null
    this.metre = null
    this.tonic = null
    this.raw = null
    this.measures = []
    this.minMajScore = 0
    this.hasElision = false
    this.nRepeat = 0
    this.isInvalid = false
    this.error = null
  }

  static fromString( phraseString, metre, tonic, timing ) {
    let songPhrase = new SongPhrase()

    if (! phraseString) {
      songPhrase.isInvalid = true
      songPhrase.error = 'No input provided.'
      return songPhrase
    }

    songPhrase.raw = phraseString.trim()
    if ( metre )  songPhrase.metre = metre.trim()
    if ( tonic )  songPhrase.tonic = tonic.trim()
    if ( timing ) songPhrase.timing = timing.trim()

    let measureStrings = 
      phraseString
        .split('|')
        .map( x => x.trim() )
        .filter( x => x )
    
    let annotations = 
      /(x[0-9]+)|([-][>])/.exec( _.takeRight( measureStrings ) )

    if ( annotations ) {
      measureStrings.pop()
      if ( annotations[1] ) songPhrase.nRepeat = parseInt( annotations[1].slice(1) )
      if ( annotations[2] ) songPhrase.hasElision = true
    }

    songPhrase.measures = 
      measureStrings
        .map( x => Measure.fromString(x, songPhrase.metre, songPhrase.tonic ) )

    // Count major and minor chords

    songPhrase.majMinScore =
      songPhrase.measures.reduce( 
          (score, measure) => score + measure.majMinScore, 0 ) 

    return songPhrase
  }

  toStrings( mapping ) {
    return _.map( this.measures, x => x.toStrings( mapping ) )
  }

  toString() {
    return this.toStrings().join(' | ')
  }

  toRelativeStrings( mapping ) {
    return _.map( this.measures, x => x.toRelativeStrings( mapping ) )
  }

  toRelativeString() {
    return this.toRelativeStrings().join(' | ')
  }

  toRootThirdStrings( mapping ) {
    return _.map( this.measures, x => x.toRootThirdStrings( mapping ) )
  }

  toRootThirdString() {
    return this.toRootThirdStrings().join(' | ')
  }

  toMaxSeventhStrings( mapping ) {
    return _.map( this.measures, x => x.toMaxSeventhStrings( mapping ) )
  }

  toMaxSeventhString() {
    return this.toMaxSeventhStrings().join(' | ')
  }

  toGoalInversionStrings( mapping ) {
    return _.map( this.measures, x => x.toGoalInversionStrings( mapping ) )
  }

  toGoalInversionString() {
    return this.toGoalInversionStrings().join(' | ')
  }

  toEvents( chordFormat ) {
    return _.flatMap( this.measures, measure => measure.toEvents( chordFormat ) )
  }
}
