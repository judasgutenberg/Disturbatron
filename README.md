# disturbatron
LAMP-stack Raspberry Pi project with a web page showing uploaded audio files that can be played (via Python script) through a megaphone attached to the Raspberry Pi


The idea is to be able to solar-power the Raspberry Pi in a remote location and use a Yagi antenna to stay in contact with your WiFi router.  

This system conserves power by using a relay (controlled by the Python scripts) to turn on the megaphone only when needed.

The web page is a simple LAMP-stack directory browser showing any files in the audio directory.  This directory can include other directories
for organization purposes.  Clicking the megaphone plays the audio on the remote Raspberry Pi whereas clicking the headphones playes it
only on the client device.  New audio can be recorded if this system is implemented via https (due to annoying Google Chrome restrictions).

Not included here are a number of cron jobs designed to clean up various messes that can result when the megaphone relay is turned on but then not turned off.  I couldn't figure out a better way to kill playing audio than just restarting apache, though of course this causes messes as well (which those cron jobs are designed to clean up). 
