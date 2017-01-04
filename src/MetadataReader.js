const _ = require('lodash')
const XLSX = require('xlsx')
const MetadataStore = require('./MetadataStore')

module.exports = class MetadataReader {
  static fromXlsxFile( filepath, sheetName ) {
    const metadataFile = XLSX.readFile( filepath )
    const metadataSheet = metadataFile.Sheets[sheetName]

    let rawdata = XLSX.utils.sheet_to_json( metadataSheet )
    return _.keyBy( rawdata, 'ID' )
  }
}

