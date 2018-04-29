// Tasks
    // need to update app so that on watch init app checks to see if a file exists on s3
    // if yes then upload is not performed 
    // else upload is performed then file is deleted from local directory

    // need to clean up bash script so junk isn't logged out during tether (minimize output)
    
    // write alternative bash script to periodically check camera for new files
    // if new files exist then copy them onto local machine for app.js to upload
    // once files have been copied have process sleep for x minutes then wake up and repeat

// Bugs 
    // app uploading first doc multiple times looks like sync issue


'use strict';
const aws = require('aws-sdk'),
       fs = require('fs'),
 { exec } = require('child_process');

// declare variables
const path = __dirname + '/gpx/';
const bucket = 'gphoto2';

// Create new S3 client 
const s3 = new aws.S3();

// check to see if gpx folder exist if yes log folder exists
// else create new folder, then log out folder created

// check to see if camera is connected if yes call watch and tether functions, then log out info
// else listen for camera to connect, once connected call watch and tether, then log out info

function watch () {
    console.log( 'Watch initialized' );

    // watch for files in the gpx folder
    fs.watch( './gpx', ( change, filename ) => {

        console.log( 'New files added to ./gpx' )

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
                    uploadS3
                }
            });
        }

        function uploadS3 () {
            console.log( 'Upload initialized' )

            // get list of files from directory
            fs.readdir( path, ( err, files ) => {
                console.log( 'Reading ./gpx directory' );

                // for each file in directory
                files.forEach( ( fileName ) => {

                    // get full path to file
                    let filePath = path + fileName;

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
                                        console.log ( fileName + 'deleted from local directory.')
                                        // // reset fileName
                                        // fileName = '';
                                    }
                                });
                            });
                        } else {
                            console.log( fileName + 'already exists in s3 bucket');
                            // delete file from directory
                            fs.unlinkSync(filePath);
                            console.log ( fileName + 'deleted from local directory.')
                        }

                    });
                });
            });
        }

        checkS3

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

module.exports.checkS3 = checkS3