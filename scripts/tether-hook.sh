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
        # check if a directory exist for gphoto 
        if [ -d $dir ]
        then 
            echo -e "${teal}    $dir folder exists ${reset}"
        else
            echo -e "${teal}    $dir folder missing"
            mkdir $dir
            echo -e "${teal}    $dir folder created ${reset}"
        fi
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