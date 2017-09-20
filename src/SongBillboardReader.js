const _ = require( 'lodash/fp' )
const Promise = require( 'bluebird' )
const fs = Promise.promisifyAll( require( 'fs' ) )

const Song = require( './Song' )
const SongSection = require( './SongSection' )

module.exports = class SongBillboardReader {
  static extractID( filepath ) {
    let filepathParts = filepath.split('/')
    if ( filepathParts.length > 1 ) {
      filepathParts = _.takeRight(2)(filepathParts)
      let idMatcher = /[0]*([1-9]{1}[0-9]*)/
      let idMatch = idMatcher.exec( filepathParts[0] )
      if ( idMatch ) return idMatch[1]
    }
    return null
  }

  static async parseFile( filepath ) {
    let song = new Song() 
    song.id = this.extractID( filepath )
    song.filepath = filepath
    song.rawData = await fs.readFileAsync( filepath, 'utf-8' )

    let context = {}
    let currentSection = null 
    let previousSection = null

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
          song.addSection( currentSection )
          currentSection = null
        }
        context.metre = dataLine.metre
      }

      else if ( dataLine.tonic ) {
        if ( currentSection ) {
          song.addSection( currentSection )
          currentSection = null
        }
        context.tonic = dataLine.tonic
      }

      else if ( dataLine.linetype === 'silence' ) {
        if ( currentSection ) {
          song.addSection( currentSection )
          currentSection = null
        }
        song.addSection( new SongSection({ type: 'silence' }) )
      }

      else if ( dataLine.linetype === 'end' ) {
        if ( currentSection ) {
          song.addSection( currentSection )
          currentSection = null
        }
        song.addSection( new SongSection({ type: 'end' }) )
      }

      else if ( dataLine.section ) {
        if ( currentSection ) 
          song.addSection( currentSection )

        currentSection = new SongSection( _.assign( context, dataLine.section ) )

        if ( dataLine.rawPhrase )
          currentSection.addPhrase( 
              dataLine.timing,
              dataLine.rawPhrase)
      }

      else if ( dataLine.linetype === 'phrase' ) 
        if ( currentSection ) {
        currentSection.addPhrase( 
            dataLine.timing,
            dataLine.rawPhrase )
        }
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

    let linePattern = /([^|]*)?(\|.*\|)?(.*)/
    let lineMatch = linePattern.exec( data )
    let zSection = false;

    if ( lineMatch && lineMatch[1] ) {
      let lineparts = _.flow([_.split(','), _.map( _.trim )])( lineMatch[1] )
      for ( var linepart of lineparts ) {
        let leader = linepart[0]
        if ( /[A-Y]/.test( leader ) ) {
          result.section = { timing: timing, label: linepart }
        }
        else if ( leader === "Z" ) {
          result.section = { timing: timing, label: linepart }
          zSection = true;
        }
        else if ( /[a-z]/.test( leader ) && /[^()]/.test( linepart ) ) {
          if (! result.section) result.section = { timing: timing }
          result.section.type = linepart
        }
      }
    }

    if ( lineMatch && lineMatch[2] ) {
      if (! zSection) result.linetype = 'phrase'
      result.rawPhrase = lineMatch[2]
    }

    if ( lineMatch && lineMatch[3] ) { 
      result.annotation = lineMatch[3]
    }

    /*
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
    */ 
    return result
  }
}
