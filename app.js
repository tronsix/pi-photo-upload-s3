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
var path = __dirname + '/gpx/';
var bucket = 'gphoto2';

// Create new S3 client 
var s3 = new aws.S3();

// check to see if gpx folder exist if not create folder

console.log('initiating folder watcher');
// watch for files in the gpx folder
fs.watch( './gpx', (change, filename) => {

    console.log('New files added to ./gpx' )

    // get list of files from directory
    fs.readdir(path, (err, files) => {
        
        console.log('Reading ./gpx directory');

        // for each file in directory
        for (let fileName of files) {

            // if file exist then ignore and don't upload

            // else
            // get full path to file
            var filePath = path + fileName;

            fs.readFile(filePath, (err, fileContent) => {
                // if unable to read file content, throw error
                if (err) console.log(err);

                console.log('uploading ' + fileName + ' to s3.')

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
                        // reset fileName
                        fileName = '';
                    }
                });
            });
        }
    });
});

console.log('initiating tethering process')
// execute child process to initiate tether bash script
exec('./tether.sh', (error, stdout, stderr) => {
    if (error) {
        console.error(`error: ${error}`);
        return;
    }
    console.log(`message: ${stdout}`);
});