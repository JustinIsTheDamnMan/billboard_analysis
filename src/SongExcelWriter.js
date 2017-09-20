const XLSX = require( 'xlsx' )
const Song = require( './Song' )
const ExcelWorkbook = require( './ExcelWorkbook' )

module.exports =
class SongExcelWriter {
  static writeSongSet( songSet, granularity, outputFilepath ) {
    let workbook = new ExcelWorkbook() 

    workbook.addSheetFromArrayData( 
        'Source Data', songSet.toNestedArrayOutput( 'SOURCE', granularity ) )
    workbook.addSheetFromArrayData(
        'Source Data Events', songSet.toFrequencyAnalysisArrayOutput( 'SOURCE' ) )
    workbook.addSheetFromArrayData(
        'Source Data Surprise', songSet.toSurpriseArrayOutput( 'SOURCE', granularity ) )

    workbook.addSheetFromArrayData( 
        'Relative Data', songSet.toNestedArrayOutput( 'RELATIVE', granularity ) )
    workbook.addSheetFromArrayData(
        'Relative Data Events', songSet.toFrequencyAnalysisArrayOutput( 'RELATIVE' ) )
    workbook.addSheetFromArrayData(
        'Relative Data Surprise', songSet.toSurpriseArrayOutput( 'RELATIVE', granularity ) )
    
    workbook.addSheetFromArrayData( 
        'Root 3rd Data', songSet.toNestedArrayOutput( 'ROOT_3RD', granularity ) )
    workbook.addSheetFromArrayData(
        'Root 3rd Data Events', songSet.toFrequencyAnalysisArrayOutput( 'ROOT_3RD' ) )
    workbook.addSheetFromArrayData(
        'Root 3rd Data Surprise', songSet.toSurpriseArrayOutput( 'ROOT_3RD', granularity ) )

    workbook.addSheetFromArrayData( 
        'Max 7th Data', songSet.toNestedArrayOutput( 'MAX_7TH', granularity ) )
    workbook.addSheetFromArrayData(
        'Max 7th Data Events', songSet.toFrequencyAnalysisArrayOutput( 'MAX_7TH' ) )
    workbook.addSheetFromArrayData(
        'Max 7th Data Surprise', songSet.toSurpriseArrayOutput( 'MAX_7TH', granularity ) )

    workbook.addSheetFromArrayData( 
        'Goal Inversion Data', songSet.toNestedArrayOutput( 'GOAL_INV', granularity ) )
    workbook.addSheetFromArrayData(
        'Goal Inversion Data Events', songSet.toFrequencyAnalysisArrayOutput( 'GOAL_INV' ) )
    workbook.addSheetFromArrayData(
        'Goal Inversion Data Surprise', songSet.toSurpriseArrayOutput( 'GOAL_INV', granularity ) )

    workbook.writeToFile( outputFilepath )
  }
}

