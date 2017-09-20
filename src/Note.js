const _ = require( 'lodash' )
const fs = require( 'fs' )

module.exports =
class Note {
  constructor() {
    this.raw = null
    this.natural = null
    this.modifier = null
    this.isInvalid = false
    this.error = null
  }

  static fromString( noteString ) {
    let result = new Note()

    result.raw = noteString

    if (! noteString) { 
      result.invalidate( "Note+fromString(): Null or empty string provided: " + noteString ) 
      return result
    }

    if ( noteString === "Cb" | noteString === "B#"
       | noteString === "E#" | noteString === "Fb" ) {

      result.invalidate( "Note+fromString(): Invalid note: " + noteString )
      return result
    }

    let noteParts = /([A-G])([#b]+)?/.exec( noteString.trim() )
    if (! noteParts ) {
      result.invalidate( "Note+fromString(): Invalid note string: " + noteString )
      return result
    }

    result.natural = noteParts[1]
    if ( noteParts[2] )
      result.modifier = noteParts[2]

    return result
  }

  static rawIntervalLength( fromRawNote, toRawNote ) {
    if ( fromRawNote == "*" || toRawNote == "*" ) return 0

    let x = x => x === "Fb" ? "E" : x
    let y = y => y === "Cb" ? "B" : y

    return Note.interval_distances()[x(y(fromRawNote))][x(y(toRawNote))];
  }

  static intervalLength( fromNote, toNote ) {
    return this.rawIntervalLength( fromNote.raw, toNote.raw );
  }

  static areEquivalent( note1, note2 ) {
    return ( this.intervalLength( note1, note2 ) == 0 );
  }

  invalidate( errorMessage ) {
    this.isInvalid = true
    this.error = errorMessage
  }

  isEquivalentTo( note ) {
    return Note.areEquivalent( this, note )
  }

  toString() {
    let result = ''
    
    if ( this.natural ) result += this.natural
    else return 'X'

    if ( this.modifier ) result += this.modifier

    return result
  }

  static interval_distances() {
    return {
      'C':  { 'C':0,  'C#':1,  'Db':1,  'D':2,  'D#':3,  'Eb':3,  'E':4,  'F':5,  'F#':6,  'Gb':6,  'G':7,  'G#':8,  'Ab':8,  'A':9,  'A#':10, 'Bb':10, 'B':11 },
      'C#': { 'C':11, 'C#':0,  'Db':0,  'D':1,  'D#':2,  'Eb':2,  'E':3,  'F':4,  'F#':5,  'Gb':5,  'G':6,  'G#':7,  'Ab':7,  'A':8,  'A#':9,  'Bb':9,  'B':10 },
      'Db': { 'C':11, 'C#':0,  'Db':0,  'D':1,  'D#':2,  'Eb':2,  'E':3,  'F':4,  'F#':5,  'Gb':5,  'G':6,  'G#':7,  'Ab':7,  'A':8,  'A#':9,  'Bb':9,  'B':10 },
      'D':  { 'C':10, 'C#':11, 'Db':11, 'D':0,  'D#':1,  'Eb':1,  'E':2,  'F':3,  'F#':4,  'Gb':4,  'G':5,  'G#':6,  'Ab':6,  'A':7,  'A#':8,  'Bb':8,  'B':9  },
      'D#': { 'C':9,  'C#':10, 'Db':10, 'D':11, 'D#':0,  'Eb':0,  'E':1,  'F':2,  'F#':3,  'Gb':3,  'G':4,  'G#':5,  'Ab':5,  'A':6,  'A#':7,  'Bb':7,  'B':8  },
      'Eb': { 'C':9,  'C#':10, 'Db':10, 'D':11, 'D#':0,  'Eb':0,  'E':1,  'F':2,  'F#':3,  'Gb':3,  'G':4,  'G#':5,  'Ab':5,  'A':6,  'A#':7,  'Bb':7,  'B':8  },
      'E':  { 'C':8,  'C#':9,  'Db':9,  'D':10, 'D#':11, 'Eb':11, 'E':0,  'F':1,  'F#':2,  'Gb':2,  'G':3,  'G#':4,  'Ab':4,  'A':5,  'A#':6,  'Bb':6,  'B':7  },
      'F':  { 'C':7,  'C#':8,  'Db':8,  'D':9,  'D#':10, 'Eb':10, 'E':11, 'F':0,  'F#':1,  'Gb':1,  'G':2,  'G#':3,  'Ab':3,  'A':4,  'A#':5,  'Bb':5,  'B':6  },
      'F#': { 'C':6,  'C#':7,  'Db':7,  'D':8,  'D#':9,  'Eb':9,  'E':10, 'F':11, 'F#':0,  'Gb':0,  'G':1,  'G#':2,  'Ab':2,  'A':3,  'A#':4,  'Bb':4,  'B':5  },
      'Gb': { 'C':6,  'C#':7,  'Db':7,  'D':8,  'D#':9,  'Eb':9,  'E':10, 'F':11, 'F#':0,  'Gb':0,  'G':1,  'G#':2,  'Ab':2,  'A':3,  'A#':4,  'Bb':4,  'B':5  },
      'G':  { 'C':5,  'C#':6,  'Db':6,  'D':7,  'D#':8,  'Eb':8,  'E':9,  'F':10, 'F#':11, 'Gb':11, 'G':0,  'G#':1,  'Ab':1,  'A':2,  'A#':3,  'Bb':3,  'B':4  },
      'G#': { 'C':4,  'C#':5,  'Db':5,  'D':6,  'D#':7,  'Eb':7,  'E':8,  'F':9,  'F#':10, 'Gb':10, 'G':11, 'G#':0,  'Ab':0,  'A':1,  'A#':2,  'Bb':2,  'B':3  },
      'Ab': { 'C':4,  'C#':5,  'Db':5,  'D':6,  'D#':7,  'Eb':7,  'E':8,  'F':9,  'F#':10, 'Gb':10, 'G':11, 'G#':0,  'Ab':0,  'A':1,  'A#':2,  'Bb':2,  'B':3  },
      'A':  { 'C':3,  'C#':4,  'Db':4,  'D':5,  'D#':6,  'Eb':6,  'E':7,  'F':8,  'F#':9,  'Gb':9,  'G':10, 'G#':11, 'Ab':11, 'A':0,  'A#':1,  'Bb':1,  'B':2  },
      'A#': { 'C':2,  'C#':3,  'Db':3,  'D':4,  'D#':5,  'Eb':5,  'E':6,  'F':7,  'F#':8,  'Gb':8,  'G':9,  'G#':10, 'Ab':10, 'A':11, 'A#':0,  'Bb':0,  'B':1  },
      'Bb': { 'C':2,  'C#':3,  'Db':3,  'D':4,  'D#':5,  'Eb':5,  'E':6,  'F':7,  'F#':8,  'Gb':8,  'G':9,  'G#':10, 'Ab':10, 'A':11, 'A#':0,  'Bb':0,  'B':1  },
      'B':  { 'C':1,  'C#':2,  'Db':2,  'D':3,  'D#':4,  'Eb':4,  'E':5,  'F':6,  'F#':7,  'Gb':7,  'G':8,  'G#':9,  'Ab':9,  'A':10, 'A#':11, 'Bb':11, 'B':0  }}
  }
}
