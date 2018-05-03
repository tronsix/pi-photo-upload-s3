#! /bin/bash 

# start 10 second tethered capture and exec tether-hook script
$gp --capture-tethered 30s --keep --hook-script $PWD/scripts/tether-hook.sh 
