const _ = require('lodash')
const SongPhrase = require('./SongPhrase')

module.exports =
class SongSection {
  constructor({ label, type, tonic, metre, timing }) {
    this.tonic = null
    this.metre = null
    this.timing = null
    this.label = null
    this.types = [] 
    this.phrases = []
    this.measureCount = 0
    this.majMinScore = 0

    if ( label ) this.label = label
    if ( type ) this.types.push( type )
    if ( tonic ) this.tonic = tonic
    if ( metre ) this.metre = metre
    if ( timing ) this.timing = timing
  }

  addPhrase( timing, rawPhrase ) {
    if (! rawPhrase) {
      return;
    }
    
    let songPhrase = SongPhrase.fromString( rawPhrase, this.metre, this.tonic )
    songPhrase.timing = timing

    this.phrases.push( songPhrase )
    this.measureCount += songPhrase.measures.length
    this.majMinScore += songPhrase.majMinScore
  }

  static toNestedArrayHeader() {
    return [
      'section_type',
      'section_label',
      'section_length',
      'tonic',
      'metre' ]
  }

  toNestedArrayOutput( chordFormat, granularity, mapping ) {
    var phraseDataMapper 
      /*
    switch( chordFormat ) {
      case 'SOURCE':
        phraseDataMapper = p => p.toStrings( mapping )
        break
      case 'RELATIVE':
        phraseDataMapper = p => p.toRelativeStrings( mapping )
        break
      case 'ROOT_3RD':
        phraseDataMapper = p => p.toRootThirdStrings( mapping )
        break
      case 'MAX_7TH':
        phraseDataMapper = p => p.toMaxSeventhStrings( mapping )
        break
      case 'GOAL_INV':
        phraseDataMapper = p => p.toGoalInversionStrings( mapping )
        break
    }
*/
    switch( chordFormat ) {
      case 'SOURCE':
        phraseDataMapper = p => _.flatten( p.toStrings( mapping ) )
        break
      case 'RELATIVE':
        phraseDataMapper = p => _.flatten( p.toRelativeStrings( mapping ) )
        break
      case 'ROOT_3RD':
        phraseDataMapper = p => _.flatten( p.toRootThirdStrings( mapping ) )
        break
      case 'MAX_7TH':
        phraseDataMapper = p => _.flatten( p.toMaxSeventhStrings( mapping ) )
        break
      case 'GOAL_INV':
        phraseDataMapper = p => _.flatten( p.toGoalInversionStrings( mapping ) )
        break
    }
    let annotation = [
                this.types.join(','), 
                this.label, 
                this.measureCount, 
                this.tonic, 
                this.metre] 

    if ( granularity === 'PHRASE' )
      return _.map( this.phrases, p => _.concat( annotation, phraseDataMapper(p) ) ) 
    else if ( granularity === 'SECTION' ) 
      return _.concat( annotation, _.flatMap( this.phrases, p => phraseDataMapper(p) ) )
    else if ( granularity === 'SONG' )
      return _.flatMap( this.phrases, p => phraseDataMapper(p) )

    return [[]]
  }

  toEvents( chordFormat ) {
    return _.flatMap( this.phrases, phrase => phrase.toEvents( chordFormat ) )
  }
}
