#!/usr/bin/env python
import pygame
import os
import RPi.GPIO as GPIO 		# import RPi.GPIO module 
import sys
GPIO.setmode(GPIO.BCM) 			# choose BCM or BOARD 
GPIO.setup(24, GPIO.OUT) 		# set GPIO24 as an output
 
try:  
	GPIO.output(24, 1)
except KeyboardInterrupt:          # trap a CTRL+C keyboard interrupt  
    GPIO.cleanup()                 # resets all GPIO ports used by this
