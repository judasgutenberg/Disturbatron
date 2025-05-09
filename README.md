# disturbatron
A LAMP-stack Raspberry Pi project with a web app (served by the Raspberry Pi itself) showing uploaded audio files (in the file system of the Raspberry Pi) that can be played (via Python script) through a megaphone (or some other device) attached to the Raspberry Pi.


The idea is to be able to solar-power the Raspberry Pi in some remote location and use something like a parabolic or Yagi antenna to stay in contact with your WiFi router.  Then you can safely hassle people (such as hillfolk monotonously shooting at trees in the nearby forest) via a megaphone from anywhere in the world.  Combined with camera surveillance, you would even be able to see who or what you were disturbing. 

This system conserves power by using a relay (controlled by the Python scripts) to turn on the megaphone and WiFi dongle only when needed.  I use a WiFi-free Raspberry Pi Zero instead of a WiFi-capable Raspberry Pi Zero W so I can use a custom antenna and turn the dongle off when it's in sleep mode (for example, in the middle of the night as determined by the clock).

The web page is a simple LAMP-stack directory browser showing any files in the audio directory.  This directory can include other directories for organizational purposes.  Clicking the megaphone plays the audio on whatever audio equipment is attached to the remote Raspberry Pi, whereas clicking the headphones plays it only on the client device browsing pages served by the Raspberry Pi.  New audio can be recorded if this system is implemented via https (due to annoying Google Chrome restrictions).

Here's what the web-based UI looks like as served from the Apache web server running on the Raspberry Pi:

![alt text](ui.png?raw=true)


This code is written without JQuery or any frameworks, so anyone interested in the basics of building a simplest-possible website that is a javascript-driven frontend interacting with a file system (not, in this case, a database) may find this code illuminating.

Not included here are a number of cron jobs designed to clean up the various messes that can result when the megaphone relay is turned on but then not turned off.  I couldn't figure out a better way to kill playing audio than just restarting Apache, though of course this results in messes as well (which those cron jobs are designed to clean up). 

# Hardware Notes: 
GPIO #24 controls the relay powering the megaphone.
GPIO #23 controls the relay powering the WiFi dongle.
These two things use a lot of power and it's best to turn them off if the Disturbatron isn't making sounds or is in hours when it won't need to communicate.

Audio is from a resistor-capacitor mid-pass filter attached to GPIO #13 (which can do PWM). Only one audio channel is needed unless you somehow rig up two megaphones (todo: merge audio channels into mono during playback).
A0 on an ads1115 reads the voltage of the lead-acid battery through a two-resistor voltage divider that reduces the voltage by about 90% so that it falls within the voltage range of the ads1115.

Though my 15 watt panel with a lawn mower battery was fine for powering this device continuously through the summer, I'm finding the solar panel is not enough to recharge the 12v battery with diminished October sunshine.

TODO: make a variant that works with LoRa, probably controlled by a special-purpose app similar to the web app in this repository.  But LoRa is proving tricky in my experiments with it.  433 MHz seems ideal since its lower frequency should get through forest vegetation better than 912 MHz.

Update: after about October 1, it's hard to keep a 12 volt battery charged with a 30 watt solar panel that is powering a continuously-running Raspberry Pi.

The Disturbatron is reliable laugh-getter when demonstrated to friends or even inlaws, though your spouse or parents will eventually get annoyed.

Here is a schematic diagram:
![alt text](disturbatrondiagram.png?raw=true)



Here is a photo of the Raspberry Pi Zero inside the one Disturbatron known to be built.

![alt text](disturbatron_pins.jpg?raw=true)


Initially the plan was to deploy this thing on the steep escarpment above a nearby bus turaround in Catskill State Park where local gun enthusiasts liked to come and shoot their guns over and over and over and over and over and over again.  But then my wife tried political pressure using our recently-elected Democratic-majority town board (which was less sympathetic to men who need to demonstrate their virility via such infantile means).  She was able to get the de facto shooting range closed down ("But what about my second amendment rights? Let us now proceed, Brandon!") and I never got around to deploying the Disturbatron that I built.
