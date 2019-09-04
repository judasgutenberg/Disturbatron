# disturbatron
LAMP-stack Raspberry Pi project with a web page showing uploaded audio files that can be played (via Python script) through a megaphone attached to the Raspberry Pi


The idea is to be able to solar-power the Raspberry Pi in a remote location and use a Yagi antenna to stay in contact with your WiFi router.  Then you can hassle people via a megaphone from anywhere in the world.  Combined with camera surveillance, you would even be able to see who you were hassling. 

This system conserves power by using a relay (controlled by the Python scripts) to turn on the megaphone only when needed.

The web page is a simple LAMP-stack directory browser showing any files in the audio directory.  This directory can include other directoriesfor organization purposes.  Clicking the megaphone plays the audio on the remote Raspberry Pi whereas clicking the headphones playes it only on the client device.  New audio can be recorded if this system is implemented via https (due to annoying Google Chrome restrictions).

This code is written without any frameworks, so anyone interested in the basics of building a website that is a frontend interacting with a file system (not, in this case, a database) may find this code illuminating.

Not included here are a number of cron jobs designed to clean up various messes that can result when the megaphone relay is turned on but then not turned off.  I couldn't figure out a better way to kill playing audio than just restarting apache, though of course this causes messes as well (which those cron jobs are designed to clean up). 

At some point I will include some hardware notes.

Hardware Notes: 
GPIO #24 controls the relay powering the megaphone.
GPIO #23 controls the relay powering the WiFi dongle.

Audio is from a resistor-capacitor mid-pass filter attached to GPIO #13 (which can do PWM). Only one audio channel is needed.
A0 on an ads1115 reads the voltage of the lead-acid battery. 
