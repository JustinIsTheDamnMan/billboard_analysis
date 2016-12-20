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
}
