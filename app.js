'use strict';
const aws = require('aws-sdk'),
       fs = require('fs'),
 chokidar = require('chokidar'),
 { exec } = require('child_process');

// declare variables
const gpx = './gpx';
const imgPath = __dirname + '/gpx/';
const bucket = 'gphoto2';
let watching = 0;

// Create new S3 client 
const s3 = new aws.S3();

function checkForDir(dir, cb) {
    fs.stat(dir, (err, stats) => {
        if (err) { 
            if (err.code === 'ENOENT'){
                return cb(null, false);
            } else {
                return cb(err);
            }
        } 
        return cb(null, stats.isDirectory());
    });
}

// check to see if gpx folder exist if yes log folder exists
// else create new folder, then log out folder created
checkForDir( gpx, (err, isDirectory) => {
    console.log('Checking if ' + gpx + ' folder exists.');
    if (isDirectory) {
        console.log( gpx + ' folder does exists.');
        checkForCamera();
        watch();
    } else {
        console.log( gpx + "folder doesn't exist. Creating folder...")
        fs.mkdir( gpx, (err) => {
            if (err) {
                console.log(err);
            } else {
                console.log( gpx + 'folder created.')
            checkForCamera();
            watch();
            }
        });
    }
});

// check to see if camera is connected if yes call watch and tether functions, then log out info
// else listen for camera to connect, once connected call watch and tether, then log out info
function checkForCamera () {
    let cameraListener = setInterval( function () {
        console.log('Listening for camera...');
        // execute child process to see if camera is connected
        exec('$gp --summary', (err, stdout) => {
            if (err) {
                console.log('No camera found.');
                return;
            } else {
                console.log('Camera connected.');
                stopListener();
                tether();
            }
        });
    }, 3000);

    function stopListener() {
        clearInterval(cameraListener);
    }
}

function watch () {

    const watcher = chokidar.watch( gpx, { persistent: true, awaitWriteFinish: { stabilityThreshold: 2000 }});

    console.log( 'Watch initialized.' );

    // watch for files in the gpx folder
    watcher.on( 'add', path => {
        console.log(watching);
        if (watching === 0){
            
            watching += 1;

            console.log(`File ${path} has been added`)

            // variable storing existing s3Images for upload validation
            const s3Images = [];
            
            // Check s3 to see which files currently exist
            function checkS3 () {
                console.log( 'Checking s3 to see which files already exists.' );

                s3.listObjectsV2({Bucket: bucket}, (err, data) => {
                    if (err) console.log(err, err.stack);

                    else {
                        var contents = data.Contents

                        contents.forEach((obj) => {
                            s3Images.forEach((i) => {
                                // if object !exist within s3Images array then add it.
                                if (obj.Key !== i){
                                    s3Images.push(obj.Key);
                                    console.log( 'Added ' + obj.Key + ' to s3Images array')
                                } 
                            });
                        });

                        console.log( 's3 files list up to date.' );
                        uploadS3();
                    }
                });
            }

            function uploadS3 () {
                console.log( 'Upload initialized.' )

                // get list of files from directory
                fs.readdir( imgPath, ( err, files ) => {
                    console.log( 'Reading ./gpx directory' );

                    // for each file in directory
                    files.forEach( ( fileName ) => {

                        // get full path to file
                        let filePath = imgPath + fileName;

                        let fileExists = s3Images.indexOf(fileName);
                            
                        // if file doesn't exist then upload
                        // else log that the file exists
                        if ( fileExists === -1 ){

                            fs.readFile(filePath, (err, fileContent) => {
                                // if unable to read file content, throw error
                                if (err) console.log(err);

                                console.log('Uploading ' + fileName + ' to s3.')

                                // upload to s3
                                s3.putObject({
                                    Bucket: bucket, 
                                    Key: fileName, 
                                    Body: fileContent,
                                    Metadata: {
                                    'content-type': 'image/jpeg'
                                    }
                                }, (err, data) => {
                                    if (err) console.log(err, err.stack); // an error occurred
                                    else {
                                        // successful response
                                        console.log( fileName + ' uploaded. Data: ' + JSON.stringify(data) );
                                        // delete file from directory
                                        fs.unlinkSync(filePath);
                                        console.log ( fileName + ' deleted from local directory.')
                                        // // reset fileName
                                        // fileName = '';
                                        watching = 0;
                                    }
                                });
                            });
                        } else {
                            console.log( fileName + ' already exists in s3 bucket');
                            // delete file from directory
                            fs.unlinkSync(filePath);
                            console.log ( fileName + ' deleted from local directory.')
                             watching = 0;
                        }
                    });
                });
            }
            checkS3();
        } else {
            setTimeout( function() {
                watch();
            }, 3000);
        }
    });
}

function tether () {
console.log('Tether initialized')
// execute child process to initiate tether bash script
exec('./scripts/tether.sh', (error, stdout, stderr) => {
    if (error) {
        console.error(`error: ${error}`);
        return;
    }
    console.log(`message: ${stdout}`);
});
}
