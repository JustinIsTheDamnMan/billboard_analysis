const _ = require( 'lodash' )
const fs = require( 'fs' )
const MetadataReader = require( './src/MetadataReader.js' )
const SongSet = require( './src/SongSet' )
const SongBillboardReader = require( './src/SongBillboardReader' )
const SongExcelWriter= require( './src/SongExcelWriter' )


const parseInputFiles = async function ( inputFiles ) {
  let parsedInputFiles = []
  for ( var idx = 0; idx < inputFiles.length; ++idx ) {
    let inputFile = inputFiles[idx]
    console.log(`Parsing: ${inputFile}`)
    parsedInputFiles.push( await SongBillboardReader.parseFile( inputFiles[idx] ) ) 
  }
  return parsedInputFiles;
}

const analysisRun = async function( parsedInputFiles, analysisParams ) {

  let songSet = 
    new SongSet( additionalInputMetadata, analysisParams.filters )

  for ( var idx = 0; idx < parsedInputFiles.length; ++idx ) {
    let parsedInputFile = parsedInputFiles[idx]
    songSet.add( parsedInputFile )
  }

  for ( var idx2 = 0; idx2 < analysisParams.reports.length; ++idx2 ) {
    let report = analysisParams.reports[idx2];
    console.log(`Writing: ${report.filepath}`)
    SongExcelWriter.writeSongSet( songSet, report.granularity, report.filepath )
  }

  return true
}

const getDirs = 
  p => fs.readdirSync( p ).filter( 
      f => fs.statSync( p + '/' + f ).isDirectory() )

const filepaths = getDirs( './source_data/McGill-Billboard' )
const inputFiles = _.map( filepaths, n => `./source_data/McGill-Billboard/${n}/salami_chords.txt` )
// const additionalInputMetadata = MetadataReader.fromXlsxFile('./source_data/mappings.xlsx', 'Sheet4')
const additionalInputMetadata = MetadataReader.fromXlsxFile('./source_data/six_time_bins_1.xlsx', 'Sheet1')

/* parseInputFiles( inputFiles ).then( ( parsedInputFiles ) => {
  const startYear = 1958
  const endYear = 1991

  let year = endYear
  for ( var idx = 0; idx <= endYear - startYear; ++idx ) { 
    year = endYear - idx
    analysisRun( parsedInputFiles, {
      filters: [
        song => song.tonality() === 'major',
        song => parseInt(song.metadata.year) === year 
      ],
      reports: [
        { granularity: 'SECTION', filepath: `output/${year}-section.xlsx`},
        { granularity: 'SONG', filepath: `output/${year}-song.xlsx`}
      ]
    })
    analysisRun( parsedInputFiles, {
      filters: [
        song => song.tonality() === 'major',
        song => parseInt(song.metadata.year) >= startYear,
        song => parseInt(song.metadata.year) <= year
      ],
      reports: [
        { granularity: 'SECTION', filepath: `output/${year}-${startYear}-section.xlsx` },
        { granularity: 'SONG', filepath: `output/${year}-${startYear}-song.xlsx` }
      ]
    })
  }
})*/

parseInputFiles( inputFiles ).then( ( parsedInputFiles ) => {
  const startBin = 1 
  const endBin = 6 

  let bin = endBin
  for ( var idx = 0; idx <= endBin - 1; ++idx ) { 
    bin = endBin - idx
    analysisRun( parsedInputFiles, {
      filters: [
        song => song.tonality() === 'major',
        song => parseInt(song.metadata.time_bin) === bin 
      ],
      reports: [
        { granularity: 'SECTION', filepath: `output/${bin}-section.xlsx`},
        { granularity: 'SONG', filepath: `output/${bin}-song.xlsx`}
      ]
    })
    analysisRun( parsedInputFiles, {
      filters: [
        song => song.tonality() === 'major',
        song => parseInt(song.metadata.time_bin) >= startBin,
        song => parseInt(song.metadata.time_bin) <= bin 
      ],
      reports: [
        { granularity: 'SECTION', filepath: `output/${bin}-${startBin}-section.xlsx` },
        { granularity: 'SONG', filepath: `output/${bin}-${startBin}-song.xlsx` }
      ]
    })
  }
})


