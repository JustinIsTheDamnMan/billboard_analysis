const _ = require( 'lodash' )

module.exports =
class Degree {
  constructor() {
    this.raw = null
    this.interval = null
    this.modifier = null
    this.isInvalid = false
    this.error = null
  }

  static fromString( degreeString ) {
    if (! degreeString ) return null

    let degree = new Degree()
    degree.raw = degreeString.trim()

    let degreeParts = /(\*?[b#]*)?([1-9][0-5]?)/.exec( degree.raw )
    
    if (! degreeParts ) {
      degree.isInvalid = true
      degree.error = "Cannot parse raw degree string: " + degree.raw
    }

    if (! degreeParts[2] ) {
      degree.isInvalid = true
      degree.error = "Cannot parse interval from degree string: " + degree.raw
    }

    degree.interval = parseInt( degreeParts[2] )

    if ( degreeParts[1] )
      degree.modifier = degreeParts[1]

    return degree
  }

  static fromListString( degreeListString ) {

    if (! degreeListString ) 
      return null

    let degreeList = { raw: degreeListString.trim(), degrees: [] }
    let degreeListParts = /[(]?([^)]*)[)]?/.exec( degreeList.raw )
    let degrees = null 

    if (! degreeListParts) 
      degrees = degreeList.raw.split(',')
   
    else
      degrees = degreeListParts[1].split(',')

    degreeList.degrees = _.map( degrees, x => this.fromString( x ) )
    return degreeList
  }

  static toListString( degrees ) {
    if (! degrees)
      return ''

    if ( degrees.length === 0 )
      return ''

    let result = _.join(
                  _.map( degrees, x => x.toString() )
                  , ',')

    return '(' + result + ')'
  }

  toString() {
    let result = ''

    if ( this.modifier ) result += this.modifier
    if ( this.interval ) result += this.interval.toString()

    return result 
  }
}
