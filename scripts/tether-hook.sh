#! /bin/bash

# declare global variables
gp="gphoto2"
getPre="--show-preview"
dir="gpx"
self=`basename $0`

# style output
green=$( tput bold && tput setaf 46 );
teal=$( tput bold && tput setaf 50 );
red=$( tput bold setaf 160 );
reset=$( tput sgr0 );

case "$ACTION" in  
    init)
        echo "${green}$self: Init ${reset}" 
    ;;
    start)
        echo "${green}$self: Start ${reset}"
    ;;
    download)
        # move downloaded image files into gpx folder
        mv $ARGUMENT $dir/$ARGUMENT
        echo "${green}$self: Downloading $ARGUMENT to /$dir ${reset}"
    ;;
    stop)
        echo "${green}$self: Stop ${reset}"
    ;;
    *)
        echo "${red}$self: unkown action: $ACTION ${reset}"
    ;;
esac