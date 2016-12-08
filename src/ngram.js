const _  = require('lodash')
const fs = require('fs')

module.exports = {
  
  to_ngrams: function( array, n ) {
    let limit = array.length - n
    if ( limit <= 0 ) 
      return _.slice( array )

    let idx = 0
    let output = []
    while ( idx <= limit ) {
      output.push( _.slice( array, idx, idx + n ) )
      idx += 1
    }
    return output
  },

  replace_dot: function( array ) {
    let idx = 0
    let previous = "."
    let limit = array.length - 1
    let output = _.slice( array )
    while (idx <= limit) {
      if (output[idx] === ".")
        output[idx] = previous
      previous = output[idx]
      idx += 1
    }
    return output
  }
}

