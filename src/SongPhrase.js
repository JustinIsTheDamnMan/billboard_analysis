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

  toStrings() {
    return this.measures.map( x => x.toString() )
  }

  toString() {
    return this.toStrings().join(' | ')
  }

  toRelativeStrings() {
    return this.measures.map( x => x.toRelativeString( this.tonic ) )
  }

  toRelativeString() {
    return this.toRelativeStrings().join(' | ')
  }

  toRootThirdStrings() {
    return this.measures.map( x => x.toRootThirdString( this.tonic ) )
  }

  toRootThirdString() {
    return this.toRootThirdStrings().join(' | ')
  }

  toMaxSeventhStrings() {
    return this.measures.map( x => x.toMaxSeventhString( this.tonic ) )
  }

  toMaxSeventhString() {
    return this.toMaxSeventhStrings().join(' | ')
  }

  toGoalInversionStrings() {
    return this.measures.map( x => x.toGoalInversionString( this.tonic ) )
  }

  toGoalInversionString() {
    return this.toGoalInversionStrings().join(' | ')
  }
}
