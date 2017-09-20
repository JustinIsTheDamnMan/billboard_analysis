const _     = require( 'lodash'  )
const Chord = require( './Chord' )
const Note  = require( './Note'  )

module.exports =
class Measure {
  constructor() {
    this.raw = null
    this.beats = null
    this.beatValue = null
    this.beatsOverride = null
    this.beatValueOverride = null
    this.majMinScore = 0 
    this.tonic = null
    this.chords = null
    this.isComplex = false
    this.isInvalid = false
    this.error = null
  }

  static fromString( rawString, metre, tonic ) {
    let result = new Measure()
    result.raw = rawString.trim()

    if ( result.raw === '*' ) {
      result.isComplex = true
    }

    else if (! metre ) {
      result.isInvalid = true
      result.error = "No metre provided."
    }
    else {
      let metreParts =  /([0-9]+)\/([0-9]+)/.exec( metre )
      if (! metreParts) {
        result.isInvalid = true
        result.error = "Cannot parse metre: " + metre
      }

      result.beats     = parseInt( metreParts[1] )
      result.beatValue = parseInt( metreParts[2] )
    }

    let metreOverrideParts = /^\(([0-9]+)\/([0-9]+)\)/.exec( result.raw )
    if ( metreOverrideParts ) {
      result.beatsOverride     = parseInt( metreOverrideParts[1] )
      result.beatValueOverride = parseInt( metreOverrideParts[2] )
    }

    let effectiveBeats = result.beatsOverride 
                         ? result.beatsOverride : result.beats
  
    if ( result.isComplex ) 
      return result

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

    // Parse chord strings in measure

    result.chords = []

    let rawChords = result.raw.split(' ') 

    // Remove in-line time signature override from
    // list of chords to parse

    if ( result.beatsOverride )
      rawChords = _.drop( rawChords )

    // Perform expansion of '.' chords

    let lastChord = null
    for (var rawChord of rawChords) {
      if (rawChord === '.') 
        rawChord = lastChord

      lastChord = rawChord
      result.chords.push( Chord.fromString( rawChord ) )
    } 

    // Attempt to fill specified number of beats
    // using provided chord list


    if ( effectiveBeats % result.chords.length === 0 ) {
      result.chords = 
        _.concat( 
          _.flatten(
            _.map( result.chords, 
                   chord => _.times( effectiveBeats / result.chords.length, 
                                     _.wrap( chord, _.cloneDeep ) ) ) ) )
    }

    // Record error if beat count and chord list length 
    // are mismatched.

    else {
      result.isInvalid = true
      result.error = "Could not expand " + result.chords.length + " chords to " + effectiveBeats + " beats."
    }

    // Calculate majMinScore
    result.majMinScore = this.calculateMajMinScore( result.tonic, result.chords )

    return result
  }

  static calculateMajMinScore( tonic, chords ) {
    
    if (! tonic ) return 0

    let tonicChords = 
      _.filter( chords,
        chord => ( chord.root && chord.root.isEquivalentTo( tonic ) ) )

    return _.reduce( tonicChords,
      function( score, chord ) {
        switch( Chord.determineMajorMinor( chord ) ) {
          case 'major':
            return score + 1
            break
          case 'minor':
            return score - 1
            break
          default:
            return score
            break
        }
      }, 0 )
  }

  m_( x, m ) {
    return ( m && m[x] ) ? m[x] : x
  }

  complex() {
    return _.times( this.beats, _.constant('*') )
  }

  complexA() {
    return _.fill( Array( this.beats ), '*' )
  }

  toStrings( m ) {
    if ( this.isComplex ) return this.complexA()

    return _.map(
        this.chords,
        x => this.m_(
          x.toString(),
          m ) )
  }

  toString( m ) {
    /*
    if ( this.isComplex ) return this.complex()

    return _.map( 
        this.chords, 
        x => this.m_(
          x.toString(),
          m ) ).join(' ')
          */
    return this.toStrings( m ).join(' ')
  }
  
  toRelativeStrings( m ) {
    if ( this.isComplex ) return this.complexA()

    return _.map(
        this.chords,
        x => this.m_(
          x.toRelativeString( this.tonic ),
          m ) )
  }

  toRelativeString( m ) {
/*    if ( this.isComplex ) return this.complex()

    return _.map( 
        this.chords, 
        x => this.m_(
          x.toRelativeString( this.tonic ),
          m ) ).join(' ')
          */
    return this.toRelativeStrings( m ).join(' ')
  }

  toRootThirdStrings( m ) {
    if ( this.isComplex ) return this.complexA()

    return _.map(
        this.chords,
        x => this.m_(
          x.toRootThirdString( this.tonic ),
          m ) )
  }

  toRootThirdString( m ) {
    /*if ( this.isComplex ) return this.complex()

    return _.map( 
        this.chords, 
        x => this.m_(
          x.toRootThirdString( this.tonic ),
          m ) ).join(' ')*/
    
    return this.toRootThirdStrings( m ).join(' ')
  }

  toMaxSeventhStrings( m ) {
    if ( this.isComplex ) return this.complexA()

    return _.map(
        this.chords,
        x => this.m_(
          x.toMaxSeventhString( this.tonic ),
          m ) )
  }

  toMaxSeventhString( m ) {
    /*
    if ( this.isComplex ) return this.complex()

    return _.map( 
        this.chords, 
        x => this.m_(
          x.toMaxSeventhString( this.tonic ),
          m ) ).join(' ')
          */
    return this.toMaxSeventhStrings( m ).join(' ')
  }

  toGoalInversionStrings( m ) {
    if ( this.isComplex ) return this.complexA()

    return _.map(
        this.chords,
        x => this.m_(
          x.toGoalInversionString( this.tonic ),
          m ) )
  }

  toGoalInversionString( m ) {
    /*
    if ( this.isComplex ) return this.complex()

    return _.map( 
        this.chords, 
        x => this.m_(
          x.toGoalInversionString( this.tonic ),
          m ) ).join(' ')
          */
    return this.toGoalInversionStrings( m ).join(' ')
  }

  toEvents( chordFormat ) {
    return _.map( this.chords, chord => chord.toString( chordFormat, this.tonic ) )
  }
}
