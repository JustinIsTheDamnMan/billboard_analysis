const fs = require("fs");
const MetadataReader = require("./src/MetadataReader.js");
const SongSet = require("./src/SongSet");
const SongBillboardReader = require("./src/SongBillboardReader");
const SongExcelWriter = require("./src/SongExcelWriter");
const rimraf = require("rimraf");

/*
    Prepare output area
 */

const OUTPUT_DIRECTORY = './output';

// Remove any existing output
rimraf.sync(OUTPUT_DIRECTORY);

// Create a clean output directory
fs.mkdirSync(OUTPUT_DIRECTORY);

/*
    Load song files
*/

// There's a parent directory for the entire dataset
const DATASET_DIRECTORY = './source_data/McGill-Billboard';

// There are sub-directories of the parent for each song.
const song_directories = fs.readdirSync(DATASET_DIRECTORY).filter(
    sub_directory => fs.statSync(DATASET_DIRECTORY + '/' + sub_directory).isDirectory()
);

// In the McGill Billboard dataset, each song's data is help in a file called 'salami_chords.txt'.
const SONG_DATA_FILENAME = 'salami_chords.txt';

// Inside of each song's sub-directory is the 'salami' file with the song's data
const allSongFiles = song_directories.map(dir => `${DATASET_DIRECTORY}/${dir}/${SONG_DATA_FILENAME}`);

/*
    Load song metadata
 */

const SONG_METADATA = MetadataReader.fromXlsxFile('./source_data/six_time_bins_1.xlsx', 'Sheet1');

/*
    Run analyses
 */

// To run analyses, parse all of the song files, then call 'analysisRun' with the desired filters and reports

parseSongFiles(allSongFiles).then(
    parsedSongFiles => analyzeByTimeBin(parsedSongFiles)
    // parsedSongFiles => analyzeBySongYear(parsedSongFiles)
);

/*
    Analyses
 */

function analyzeByTimeBin(allSongFiles) {
    const startBin = 1;
    const endBin = 6;

    let bin = endBin;
    for (let idx = 0; idx <= endBin - 1; ++idx) {
        bin = endBin - idx;

        analysisRun(`Full time bin ${bin}`, allSongFiles, {
            filters: [
                song => song.tonality() === 'major',
                song => parseInt(song.metadata.time_bin) === bin
            ],
            reports: [
                {granularity: 'SECTION', filepath: `output/${bin}-section.xlsx`},
                {granularity: 'SONG', filepath: `output/${bin}-song.xlsx`}
            ]
        });

        analysisRun(`Only bins ${startBin}-${bin}`, allSongFiles, {
            filters: [
                song => song.tonality() === 'major',
                song => parseInt(song.metadata.time_bin) >= startBin,
                song => parseInt(song.metadata.time_bin) <= bin
            ],
            reports: [
                {granularity: 'SECTION', filepath: `output/${bin}-${startBin}-section.xlsx`},
                {granularity: 'SONG', filepath: `output/${bin}-${startBin}-song.xlsx`}
            ]
        })
    }

    console.log(`Analysis run complete.`);
}

function analyzeBySongYear(allSongFiles) {
    const startYear = 1958;
    const endYear = 1991;

    let year = endYear;
    for (let idx = 0; idx <= endYear - startYear; ++idx) {
        year = endYear - idx;
        analysisRun(allSongFiles, {
            filters: [
                song => song.tonality() === 'major',
                song => parseInt(song.metadata.year) === year
            ],
            reports: [
                {granularity: 'SECTION', filepath: `output/${year}-section.xlsx`},
                {granularity: 'SONG', filepath: `output/${year}-song.xlsx`}
            ]
        });
        analysisRun(allSongFiles, {
            filters: [
                song => song.tonality() === 'major',
                song => parseInt(song.metadata.year) >= startYear,
                song => parseInt(song.metadata.year) <= year
            ],
            reports: [
                {granularity: 'SECTION', filepath: `output/${year}-${startYear}-section.xlsx`},
                {granularity: 'SONG', filepath: `output/${year}-${startYear}-song.xlsx`}
            ]
        });
    }
}

/*
    Supporting functions
 */

async function parseInputFile(inputFile) {
    console.log(`Parsing: ${inputFile}`);
    return await SongBillboardReader.parseFile(inputFile);
}

async function parseSongFiles(inputFiles) {
    const parsedInputFiles = [];

    for (const inputFile of inputFiles) {
        parsedInputFiles.push(await parseInputFile(inputFile));
    }
    return parsedInputFiles;
}

function analysisRun(name, parsedInputFiles, analysisParams) {
    console.log(`Starting analysis run: ${name}.`);

    const songSet = new SongSet(SONG_METADATA, analysisParams.filters);
    parsedInputFiles.forEach(songSet.add.bind(songSet));
    analysisParams.reports.forEach(report => {
        console.log(`Writing: ${report.filepath}`);
        SongExcelWriter.writeSongSet(songSet, report.granularity, report.filepath);
    });

    console.log(`Analysis run: ${name} complete.`);
    return true
}
