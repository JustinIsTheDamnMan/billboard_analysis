const XLSX = require('xlsx')

module.exports =
class ExcelWorkbook {
  constructor() {
    this.SheetNames = []
    this.Sheets = {}
  }

  addSheetFromArrayData( sheetName, data ) {
    var sheet = {}
    var range = {s: {c: 10000000, r: 10000000}, e: {c: 0, r: 0}}
    for (var row = 0; row != data.length; ++row) {
      for (var col = 0; col != data[row].length; ++col) {

        if ( range.s.r > row ) range.s.r = row
        if ( range.s.c > col ) range.s.c = col
        if ( range.e.r < row ) range.e.r = row
        if ( range.e.c < col ) range.e.c = col

        var cell = { v: data[row][col] }
        if ( cell.v == null ) continue
        else if ( typeof cell.v === 'number' ) cell.t = 'n'
        else if ( typeof cell.v === 'boolean' ) cell.t = 'b'
        else cell.t = 's' 

        var cell_ref = XLSX.utils.encode_cell( { c:col, r:row } )
        sheet[ cell_ref ] = cell
      }
    }

    if ( range.s.c < 10000000 ) 
      sheet['!ref'] = XLSX.utils.encode_range( range )

    this.SheetNames.push( sheetName )
    this.Sheets[ sheetName ] = sheet
  }

  writeToFile( filepath ) {
    XLSX.writeFile( this, filepath )
  }
}

