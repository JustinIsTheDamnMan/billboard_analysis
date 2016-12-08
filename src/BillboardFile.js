import _ from 'lodash'
import fs from 'fs'

class BillboardFile {
  static parseLine( dataLine ) {
    let data = dataLine.trim()
    if (data[0] === '#')
      return this.parseHashLine( data )
    
    let timingMatcher  = /^([-+]?[0-9]*\.?[0-9]+([eE][-+]?[0-9]+)?)(.*)/
    let timingResults = timingMatcher.exec( dataLine )
    if ( !timingResults ) 
      return null
    else 
      return this.parseDataLine( timingResults[1], timingResults[3] )
  }
  
  static parseHashLine( hashLine ) {
    let hashLineMatcher  = /^#([a-z ]*):(.*)/
    let hashLineResults = hashLineMatcher.exec(hashLine)

    let result = { linetype: 'annotation' }
    result[hashLineResults[1].trim()] = hashLineResults[2].trim()

    return result
  }

  static parseDataLine( timing, remainder ) {
    let result = { timing: timing, linetype: 'non-musical' }
    let data = remainder.trim()

    if (data == 'silence') {
      result.linetype = 'silence'
      return result
    }

    if (data == 'end') {
      result.linetype = 'end'
      return result
    }

    let components = _.map( data.split(','), component => component.trim() )
    let beforeEventData = true;
    let zSection = false;

    for ( var component of components ) {
      let leader = component[0]

      if ( beforeEventData && /[A-Y]/.test( leader ) ) 
        result.section = { label: component }

      else if ( beforeEventData && leader === "Z" ) {
        result.section = { label: component }
        zSection = true;
      }

      else if ( beforeEventData && /[a-z]/.test( leader ) && /[^()]/.test( component ) ) {
        if (! result.section )
          result.section = {}
        result.section.type = component
      }

      else if ( beforeEventData && !/[|]/.test( component ) ) 
        result.annotation = component 

      else if ( leader === '|' ) {
        if (! zSection) result.linetype = 'phrase'
        result.rawPhrase = component
        beforeEventData = false;
      }

      else if (! beforeEventData) {
        result.annotation = component
      }
    }
    
    return result
  }

  constructor( filepath ) {
    this.filepath = filepath
    this.rawData = fs.readFileSync( filepath ).toString()
    let dataLines = _.compact(
                      _.map(
                        this.rawData.split( '\n' ),
                        line => BillboardFile.parseLine( line ) ))

    this.sections = []

    let context = {}
    let currentSection = null 
    for (var dataLine of dataLines) {

      if ( dataLine.title )
        this.title = dataLine.title

      else if ( dataLine.artist )
        this.artist = dataLine.artist

      else if ( dataLine.metre ) {
        if ( currentSection ) {
          this.sections.push( currentSection )
          currentSection = null
        }
        context.metre = dataLine.metre
      }

      else if ( dataLine.tonic ) {
        if ( currentSection ) {
          this.sections.push( currentSection )
          currentSection = null
        }
        context.tonic = dataLine.tonic
      }

      else if ( dataLine.linetype === 'silence' ) {
        if ( currentSection ) {
          this.sections.push( currentSection )
          currentSection = null
        }
        this.sections.push( { type: 'silence' } )
      }

      else if ( dataLine.linetype === 'end' ) {
        if ( currentSection ) {
          this.sections.push( currentSection )
          currentSection = null
        }
        this.sections.push( { type: 'end' } )
      }

      else if ( dataLine.section ) {
        if ( currentSection ) 
          this.sections.push( currentSection )

        currentSection = _.assign( {}, dataLine.section, context, 
                           { phrases: [], time: dataLine.timing } )

        if ( dataLine.rawPhrase )
          currentSection.phrases.push( 
              { time: dataLine.timing, phrase: dataLine.rawPhrase } )
      }

      else if ( dataLine.linetype === 'phrase' ) 
        currentSection.phrases.push( 
            { time: dataLine.timing, phrase: dataLine.rawPhrase } )
    }
  }
}

export default BillboardFile
