const _ = require( 'lodash' )
const ExcelWorkbook = require( '../src/ExcelWorkbook' )
const SongBillboardReader = require( '../src/SongBillboardReader' )
const SongExcelWriter = require( '../src/SongExcelWriter' )
const SongSet = require( '../src/SongSet' )
const MetadataReader = require( '../src/MetadataReader.js' )
const fs = require('fs')

const chai = require('chai')
const chaiAsPromised = require('chai-as-promised')
chai.use( require('chai-subset') )
chai.use( chaiAsPromised )
chai.should()

let writeSong = async function() {

    const dirs = p => fs.readdirSync(p).filter(f => fs.statSync(p+"/"+f).isDirectory())
    const filepaths = dirs( './source_data/McGill-Billboard' )
    const TEST_FILEPATHS = _.map( filepaths, n => `./source_data/McGill-Billboard/${n}/salami_chords.txt` )

    let songFilters = [
      song => song.tonality() === 'major'
    ]

    let songSet = 
      new SongSet( 
        MetadataReader.fromXlsxFile('./source_data/mappings.xlsx', 'Sheet4')
        ,songFilters )

    for ( var idx = 0; idx < TEST_FILEPATHS.length; ++idx ) {
      let song = await SongBillboardReader.parseFile( TEST_FILEPATHS[idx] )
      songSet.add(song)
    }

    //SongExcelWriter.writeSongSet( songSet, 'PHRASE', './phrase.xlsx' )
    SongExcelWriter.writeSongSet( songSet, 'SECTION', './section.xlsx' )
    SongExcelWriter.writeSongSet( songSet, 'SONG', './song.xlsx' )

    //console.log( JSON.stringify( songSet.toSurpriseArrayOutput( 'RELATIVE', 'SONG' ) ) )
    return true
}

describe('ExcelWorkbook', function() {
  this.timeout(500000)

  it('should correctly create Excel file.', function() {
    var sheetData = [['A','B','C'],[1, 2, 3], ['a', 'b', 'c']]
    const workbook = new ExcelWorkbook()
    workbook.addSheetFromArrayData( 'First Sheet', sheetData )

    sheetData.push(['AA', 11, 'BB'])
    workbook.addSheetFromArrayData( 'Second Sheet', sheetData )

    workbook.writeToFile( '/tmp/ExcelWorkbookTest.xlsx' )

    var test = !workbook
    test.should.equal( false )
  })

  it('should correctly write a song', function() {
    let x = writeSong()
    return x.should.eventually.equal( true )
  })
})

