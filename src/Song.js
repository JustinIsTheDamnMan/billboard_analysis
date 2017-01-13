const _ = require( 'lodash' )
const SongSection = require( './SongSection' )

module.exports = class Song {
  constructor() {
    this.id = null
    this.title = null
    this.sections = []
    this.majMinScore = 0 
    this.metadata = {}
    this.previousSection = null
  }

  addSection( section ) {
    this.sections.push( section )

    if ( this.previousSection &&
         _.startsWith( this.previousSection.types[0] == 'verse' ) && 
         _.startsWith( section.types[0],'chorus' ) ) 
    {
      this.previousSection.types.push('pre-chorus')
      section.types.push('post-verse')
    }

    this.previousSection = section
    this.majMinScore += section.majMinScore
  }

  tonality() {
    if ( this.majMinScore >= 0 ) return 'major'
    return 'minor'
  }

  static toNestedArrayHeader( granularity ) {
  
    let song_annotations = [
          'id','title','artist','tonality','peak_rank','weeks_on_chart',
          'year','era','quartile','sextile']

    if ( granularity === 'SONG' )
      return song_annotations
    
    return _.concat( 
            song_annotations,
            SongSection.toNestedArrayHeader() )
  }

  toNestedArrayOutput( chordFormat, granularity, mapping ) {

    let annotations = 
              [ this.id, 
                this.title, 
                this.metadata.artist,
                this.tonality(),
                this.metadata.peak_rank,
                this.metadata.weeks_on_chart,
                this.metadata.year,
                this.metadata.era,
                this.metadata.quartile,
                this.metadata.sextile ]
      
    switch ( granularity ) {
      case 'PHRASE':
        return this.writePhrases( annotations, chordFormat, mapping )
        break
      case 'SECTION':
        return this.writeSections( annotations, chordFormat, mapping )
        break
      case 'SONG':
        return this.writeSong( annotations, chordFormat, mapping )
        break
      default:
        return this.writeSong( annotations, chordFormat, mapping )
        break
    }
  } 

  writePhrases( annotations, chordFormat, mapping ) {
    return _.map( 
            _.flatMap( 
              this.sections, 
              s => s.toNestedArrayOutput( chordFormat, 'PHRASE', mapping ) ),
            s => _.concat( annotations, s ) )
  }

  writeSections( annotations, chordFormat, mapping ) {
    return _.map( 
             this.sections, 
             s => _.concat( annotations, s.toNestedArrayOutput( chordFormat, 'SECTION', mapping ) ) )
  }

  writeSong( annotations, chordFormat, mapping ) {
    return [ _.concat(
              annotations,
              _.flatMap(
                this.sections,
                s => s.toNestedArrayOutput( chordFormat, 'SONG', mapping ) ) ) ]
  }

  toEvents( chordFormat ) {
    return _.flatMap( this.sections, section => section.toEvents( chordFormat ) )
  }
}
