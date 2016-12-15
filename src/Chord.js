import _ from 'lodash'
import Note from './Note'
import Degree from './Degree'

class Chord {
  constructor() {
    this.raw = null
    this.root = null
    this.components = null
    this.bass = null
    this.isPause = false
    this.isUnknown = false
    this.isInvalid = false    
    this.error = null
    this.isMajor = false
    this.isMinor = false
  }

  static fromString( chordString ) {
    let result = new Chord()

    if (! chordString) {
      result.isInvalid = true
      result.error = 'No input.'
      return result
    }

    let cleanChordString = chordString.replace(/\s+/g, '')
    let chordStringParts = /^([^:\/]*):?([^\/]*)?\/?(.*)?$/.exec( cleanChordString )

    result.raw = cleanChordString

    if (! chordStringParts) {
      result.isInvalid = true
      result.error = 'Cannot parse input: ' + cleanChordString
      return result
    }
    
    if ( chordStringParts[1] ) {
      let root = this.parseRoot( chordStringParts[1] )
      result.root = root

      if ( root.isPause ) {
        result.isPause = root.isPause
        result.root = null
      }
      if ( root.isUnknown ) {
        result.isUnknown = root.isUnknown
        result.root = null
      }
      if ( root.bass ) {
        result.bass = root.bass
        result.root = null
      }
      if ( root.isInvalid ) {
        result.isInvalid = true
        result.error = result.root.error
      }
    }
    
    if ( chordStringParts[2] ) {
      result.components = this.parseComponent( chordStringParts[2] )

      if ( result.components.isInvalid ) {
        result.isInvalid = true
        result.error = result.components.error
      }
    }

    if ( chordStringParts[3] ) {
      result.bass = Degree.fromString( chordStringParts[3] )

      if ( result.bass.isInvalid ) {
        result.isInvalid = true
        result.error = result.bass.error
      }
    }   

    switch ( this.determineMajorMinor( result ) ) {
      case 'major':
        result.isMajor = true
        break
      case 'minor':
        result.isMinor = true
        break
      default:
        break
    }
    
    return result
  }

  static parseRoot( rootString ) {
    let root = {}

    if (! rootString ) {
      root.isInvalid = true
      root.error = 'No input'
      return root
    }
    root.raw = rootString.trim()

    switch( root.raw ) {
      case '&pause':
        root.isPause = true
        break
      case 'N':
        root.isUnknown = true
        break
      case '1':
        root.bass = Degree.fromString('1') 
        break
      default:
        root = Note.fromString( root.raw )
        break
    }
    return root
  }

  static parseComponent( componentString ) {
    let components = {}

    if (! components ) { 
      components.isInvalid = true
      components.error = 'No input'
      return components 
    }
    components.raw = componentString.trim()

    let componentParts = /([^()]+)?(\([^()]+\))?/.exec( components.raw )

    if (! componentParts ) {
      components.isInvalid = true
      components.error = 'Cannot parse component string: ' + components.raw
      return components
    }

    if ( componentParts[1] ) {
      components.shorthand = this.parseShorthand( componentParts[1].trim() )

      if ( components.shorthand.isInvalid ) {
        components.isInvalid = true
        components.error = components.shorthand.error
      }
    }

    if ( componentParts[2] ) { 
      components.degreeList = Degree.fromListString( componentParts[2].trim() )

      if ( components.degreeList.isInvalid ) {
        components.isInvalid = true
        components.error = components.degreeList.error
      }
    }

    return components
  }

  static parseShorthand( shorthandString ) {
    let shorthand = {
      raw: null,
      stem: null,
      degree: null,
      isInvalid: false,
      error: null
    }
    
    if (! shorthandString ) {
      shorthand.isInvalid = true
      shorthand.error = 'No input'
      return shorthand
    }
    shorthand.raw = shorthandString

    let shorthandParts = 
      /(^[a-z]{3,6}|^1$|^5$|^7$|^9$|^11$|^13$)([0-9]{1,2})?/.exec( shorthandString )    

    if (! shorthandParts)  {
      shorthand.isInvalid = true
      shorthand.error = 'Cannot parse shorthand: ' + shorthandString
      return shorthand
    }

    if ( shorthandParts[1] ) 
      shorthand.stem = shorthandParts[1]

    if ( shorthandParts[2] ) 
      shorthand.degree = parseInt( shorthandParts[2] )

    return shorthand
  }

  static determineMajorMinor( chord ) {
    if (! chord.components)
      return 'none'

    let shorthand = chord.components.shorthand

    if (! shorthand)
      return 'none'

    if (! shorthand.stem)
      return 'major'

    if (/(^min)|(^dim)/.test( shorthand.stem ) )
      return 'minor' 

    else if ( /(maj)|(sus)|(aug)|(hdim)|(7)|(9)|(11)|(13)/.test( shorthand.stem ) )
      return 'major' 

    let degreeList = chord.components.degreeList

    if (! degreeList )
      return 'none'

    if ( -1 < _.findIndex( degreeList.degrees, x => x.raw === 'b3' ) )
      return 'minor'

    else if ( shorthand.stem === '1' 
              && -1 < _.findIndex( degreeList.degrees, x => x.raw === '3' ) ) {
      return 'major'
    }

    return 'none'
  }

  getSpecialValues() {
    if ( this.raw === '&pause' || this.raw === 'N' ) return this.raw
    if ( this.raw === '1' ) return '/1'
    return null 
  }

  getRelativeRoot( tonicNote ) {
    if ( this.root && this.root.natural ) {
      return (1 + Note.intervalLength( tonicNote, this.root )).toString()
    }

    return null
  }

  getThird() {
    if (this.isMajor) return 'major'
    else if (this.isMinor) return 'minor'
    else return 'none'
  }

  getAdjustedInversion() {
    if (! this.bass) return '1'
    else
      return this.bass.raw
  }

  toRelativeString( tonicNote ) {
    let specialValue = this.getSpecialValues()
    if ( specialValue ) return specialValue

    let relativeRoot = this.getRelativeRoot( tonicNote )
    if (! relativeRoot) return 'X' 

    let result = relativeRoot
    if ( this.components ) result = result + ":" + this.components.raw
    if ( this.bass ) result = result + "/" + this.bass.raw
    return result
  }

  toRootThirdString( tonicNote ) {
    let specialValue = this.getSpecialValues()
    if ( specialValue ) {
      if ( specialValue === '/1' ) return '1:none/1'
      else return specialValue
    }

    let relativeRoot = this.getRelativeRoot( tonicNote )
    if (! relativeRoot) return 'X'

    return relativeRoot + ":" + this.getThird() + "/" + this.getAdjustedInversion()
  }

  toMaxSeventhString( tonicNote ) {
    let specialValue = this.getSpecialValues()
    if ( specialValue ) {
      if ( specialValue === '/1' ) return '1/1'
      else return specialValue
    }

    let result = '' 
    let shorthand = null
    let degreeList = null

    if (! this.components ) {
      result = '1'
    }
    else {
      shorthand = this.components.shorthand
      degreeList = this.components.degreeList
    }

    if ( shorthand ) {

      if ( shorthand.stem ) {
           if ( /^[13579]{1,2}$/.test( shorthand.stem ) ) {
             result = ( parseInt( shorthand.stem ) > 7 ) ? '7' : shorthand.stem 
           }
           else 
             result = shorthand.stem
      }

      if ( shorthand.degree )
        result += Math.min( shorthand.degree, 7 ).toString()
    }
   
    if ( degreeList ) {

      let degrees = degreeList.degrees

      // if shorthand is min6 or maj6,
      // filter out 7th degree components as well
      let limit = 
           ( shorthand 
             && shorthand.degree 
             && shorthand.degree === 6 ) ? 6 : 7

      degrees = _.filter( degrees, degree => ( degree.interval <= limit ) )
      
      result += Degree.toListString( degrees )
    }

     result += '/' + this.getAdjustedInversion() 

    return result
  }

  toGoalInversionString( tonicNote ) {
    let specialValue = this.getSpecialValues()
    if ( specialValue ) 
      return ( specialValue === '/1' ) ? '1:1/1' : specialValue 

    let relativeRoot = this.getRelativeRoot( tonicNote )
    if (! relativeRoot) return 'X'

    return relativeRoot + ":" + this.toMaxSeventhString( tonicNote )
  }
}

export default Chord
