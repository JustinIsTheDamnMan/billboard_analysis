const _ = require( 'lodash/fp' )
const Promise = require( 'bluebird' )
const fs = Promise.promisifyAll( require( 'fs' ) )

const Song = require( './Song' )
const SongSection = require( './SongSection' )

module.exports =
class SongBillboardReader {

  static async parseFile( filepath, id ) {
    let song = new Song() 
    song.id = id
    song.filepath = filepath
    song.rawData = await fs.readFileAsync( filepath, 'utf-8' )

    let context = {}
    let currentSection = null 

    const dataLines = 
      _.flow([
          _.split( '\n' ),
          _.map( this.parseLine.bind(this) ),
          _.compact
        ]
      )( song.rawData )

    _.forEach( dataLine => {
      if ( dataLine.title )
        song.title = dataLine.title

      else if ( dataLine.artist )
        song.artist = dataLine.artist

      else if ( dataLine.metre ) {
        if ( currentSection ) {
          song.sections.push( currentSection )
          currentSection = null
        }
        context.metre = dataLine.metre
      }

      else if ( dataLine.tonic ) {
        if ( currentSection ) {
          song.sections.push( currentSection )
          currentSection = null
        }
        context.tonic = dataLine.tonic
      }

      else if ( dataLine.linetype === 'silence' ) {
        if ( currentSection ) {
          song.sections.push( currentSection )
          currentSection = null
        }
        song.sections.push( { type: 'silence' } )
      }

      else if ( dataLine.linetype === 'end' ) {
        if ( currentSection ) {
          song.sections.push( currentSection )
          currentSection = null
        }
        song.sections.push( { type: 'end' } )
      }

      else if ( dataLine.section ) {
        if ( currentSection ) 
          song.sections.push( currentSection )

        currentSection = new SongSection( _.assign( context, dataLine.section ) )

        if ( dataLine.rawPhrase )
          currentSection.addPhrase( 
              dataLine.timing,
              dataLine.rawPhrase)
      }

      else if ( dataLine.linetype === 'phrase' ) 
        currentSection.addPhrase( 
            dataLine.timing,
            dataLine.rawPhrase )

    })( dataLines )

    return song;
  }

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

    let lineparts = _.flow([_.split(','), _.map( _.trim )])( data )

    let beforeEventData = true;
    let zSection = false;

    for ( var linepart of lineparts ) {
      let leader = linepart[0]

      if ( beforeEventData && /[A-Y]/.test( leader ) ) { 
        result.section = { timing: timing, label: linepart }
      }

      else if ( beforeEventData && leader === "Z" ) {
        result.section = { timing: timing, label: linepart }
        zSection = true;
      }

      else if ( beforeEventData && /[a-z]/.test( leader ) && /[^()]/.test( linepart ) ) {
        if (! result.section) result.section = { timing: timing }
        result.section.type = linepart
      }

      else if ( beforeEventData && !/[|]/.test( linepart ) ) 
        result.annotation = linepart 

      else if ( leader === '|' ) {
        if (! zSection) result.linetype = 'phrase'
        result.rawPhrase = linepart
        beforeEventData = false;
      }

      else if (! beforeEventData) {
        result.annotation = linepart
      }
    }
    
    return result
  }

}
