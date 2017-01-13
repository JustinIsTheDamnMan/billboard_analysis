const _ = require( 'lodash' )
const Song = require( './Song' )

module.exports = class SongSet {
  constructor( metadata, filters ) {
    this.metadataStore = metadata
    this.songFilters = filters 
    this.songStore = []
  }

  add( song ) {
    if ( song.id && this.metadataStore[ song.id ] ) {
      song.metadata = this.metadataStore[ song.id ]

      if ( this.passFilter( song ) )
        this.songStore.push( song )

      return 1
    }
    return 0
  }

  passFilter( song ) {
    if ( this.songFilters ) {
      for (var songFilter of this.songFilters) {
        if (! songFilter( song ) )
          return false
      }
    }
    return true
  }

  toNestedArrayOutput( outputStyle, granularity, mapping ) {
    return _.reduce( this.songStore,
                     ( output_, song ) => {
                        _.forEach( 
                            song.toNestedArrayOutput( outputStyle, granularity, mapping ),  
                            row => output_.push( row ) )
                        return output_
                     },
                     [ Song.toNestedArrayHeader( granularity ) ] )
  }

  toEvents( chordFormat ) {
    return _.flatMap( this.songStore, song => song.toEvents( chordFormat ) )
  }

  toEventFrequencyMap( chordFormat ) {
    return _.omit( _.countBy( this.toEvents( chordFormat ) ), ['N', 'X', '*', '&pause'] )
  }

  toFrequencyAnalysisArrayOutput( chordFormat ) {
    let event_v_map = this.toEventFrequencyMap( chordFormat ) 
    let event_v_pairs = _.toPairs( event_v_map )
    event_v_pairs = _.orderBy( event_v_pairs, pair => pair[1], 'desc' )
    
    let N = _.reduce( event_v_pairs, ( n, pair ) => n + pair[1], 0 )

    let rel_v = v => v / N
    let surprise = v => -1 * Math.log2( rel_v( v ) ) 
    
    let X = 
      _.concat([['event','frequency','relative_freq','-log2(relative_freq)']],
        _.map( 
          event_v_pairs, 
          event_v_pair => _.concat( 
                            event_v_pair, 
                            rel_v( event_v_pair[1] ), 
                            surprise( event_v_pair[1] ) ) ) )

    return X
  }

  toSurpriseArrayOutput( chordFormat, granularity ) {
    let analysis = this.toFrequencyAnalysisArrayOutput( chordFormat )
    analysis = _.map( analysis, x => [x[0], x[3]] )
    let mapping = _.fromPairs( analysis )
    return this.toNestedArrayOutput( chordFormat, granularity, mapping )
  }
}
