import _ from 'lodash'
import fs from 'fs'

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

    if ( noteString.length > 2 ) {
      result.invalidate( "Note+fromString(): Note string should not be longer than 2 characters: " + noteString )
      return result
    }

    let noteParts = /([A-G])([#b])?/.exec( noteString.trim() )
    if (! noteParts ) {
      result.invalidate( "Note+fromString(): Invalid note string: " + noteString )
      return result
    }

    result.natural = noteParts[1]
    if ( noteParts[2] )
      result.modifier = noteParts[2]

    return result
  }

  invalidate( errorMessage ) {
    this.isInvalid = true
    this.error = errorMessage
  }
}

export default Note
