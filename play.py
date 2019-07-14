#!/usr/bin/env python
import pygame
import os
import RPi.GPIO as GPIO 		# import RPi.GPIO module 
import sys
from time import sleep 
					# lets us have a delay 
GPIO.setmode(GPIO.BCM) 			# choose BCM or BOARD 
GPIO.setup(24, GPIO.OUT) 		# set GPIO24 as an output
#pygame.mixer.init()
  
audioFile = sys.argv[1]
print audioFile
try:  
	#while True:  
	GPIO.output(24, 0)         # set GPIO24 to 1/GPIO.HIGH/True
	
	pygame.mixer.init()
	pygame.mixer.music.load(audioFile)
	pygame.mixer.music.play()
	#sleep(0.2)
	while pygame.mixer.music.get_busy():
		sleep(0.1)
		GPIO.output(24, 0)         # set GPIO24 to 0/GPIO.LOW/False  
		sleep(0.1)                 # wait half a second  
	GPIO.output(24, 1)
except KeyboardInterrupt:          # trap a CTRL+C keyboard interrupt  
    GPIO.cleanup()                 # resets all GPIO ports used by this
