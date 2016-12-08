import _ from 'lodash'
import fs from 'fs'
import Note from './Note'

class Chord {
  constructor() {
    this.raw = null
    this.root = null
    this.components = null
    this.bass = null
    this.isPause = false
    this.isUnknown = false
    this.isInvalid = false    
  }

  static fromString( chordString ) {
    let result = new Chord()

    let cleanChordString = chordString.replace(/\s+/g, '')
    let chordStringParts = /^([^:\/]*):?([^\/]*)?\/?(.*)?$/.exec( cleanChordString )

    result.raw = cleanChordString

    if (! chordStringParts) {
      result.isInvalid = true;
      result.error = 'Cannot parse input: ' + cleanChordString
      return result;
    }
    
    let rootPart = chordStringParts[1]
    switch( rootPart ) {
      case '&pause':
        result.isPause = true
        break
      case 'N':
        result.isUnknown = true
        break
      case '1':
        result.bass = { raw: "1" }
        break
      default:
        if ( /^[A-G]$/.test( rootPart[0] ) ) {
          result.root = Note.fromString( rootPart ) 
          if ( result.root.isInvalid ) result.isInvalid = true
        } 
        else {
          result.isInvalid = true
          result.error = 'Unexpected rootPart: ' + rootPart
        }
        break
    }

    let componentPart = chordStringParts[2]

    if ( componentPart ) 
      result.components = { raw: componentPart }

    let bassPart = chordStringParts[3]

    if ( bassPart ) 
      result.bass = { raw: bassPart }

    return result;
  }
}

export default Chord

