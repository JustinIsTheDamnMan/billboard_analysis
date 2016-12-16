import _ from 'lodash'
import Measure from './Measure'

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

    let measureStrings = phraseString.split('|')
    measureStrings = _.map( measureStrings, x => x.trim() )
    
    let annotations = 
      /(x[0-9]+)|([-][>])/.exec( _.takeRight( measureStrings ) )

    if ( annotations ) {
      measureStrings = _.dropRight( measureStrings )
      if ( annotations[1] ) songPhrase.nRepeat = parseInt( annotations[1].slice(1) )
      if ( annotations[2] ) songPhrase.hasElision = true
    }

    songPhrase.measures = _.map( measureStrings,
                                 x => Measure.fromString(x, songPhrase.metre, songPhrase.tonic ) )
    
    // Count major and minor chords

    songPhrase.majMinScore =
      _.reduce( songPhrase.measures,
                function( score, measure ) { 
                  return score + measure.majMinScore
                }, 0 )

    return songPhrase
  }

  toStrings() {
    return _.map( this.measures, x => x.toString() )
  }

  toString() {
    return this.toStrings().join(' | ')
  }

  toRelativeStrings() {
    return _.map( this.measures, x => x.toRelativeString( this.tonic ) )
  }

  toRelativeString() {
    return this.toRelativeStrings().join(' | ')
  }

  toRootThirdStrings() {
    return _.map( this.measures, x => x.toRootThirdString( this.tonic ) )
  }

  toRootThirdString() {
    return this.toRootThirdStrings().join(' | ')
  }

  toMaxSeventhStrings() {
    return _.map( this.measures, x => x.toMaxSeventhString( this.tonic ) )
  }

  toMaxSeventhString() {
    return this.toMaxSeventhStrings().join(' | ')
  }

  toGoalInversionStrings() {
    return _.map( this.measures, x => x.toGoalInversionString( this.tonic ) )
  }

  toGoalInversionString() {
    return this.toGoalInversionStrings().join(' | ')
  }
}

export default SongPhrase
