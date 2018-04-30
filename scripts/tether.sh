#! /bin/bash 

# start 10 second tethered capture and exec tether-hook script
$gp --capture-tethered 10s --hook-script $PWD/scripts/tether-hook.sh 
