#! /bin/bash 

# listen for camera and log out camera info once connected
$gp --auto-detect

# start 10 second tethered capture and exec tether-hook script
$gp --capture-tethered 5s --hook-script $PWD/tether-hook.sh 
