"use strict";

/*
*
* Module to take the time a print as been running, (in seconds)
* and return that time in minutes or hours, depending on the time.
*
*/


exports.getTimeRunning = (timeRunning) => {
  timeRunning = timeRunning / 60 / 60;
  if (timeRunning < 1) {
    timeRunning = timeRunning * 60;
    timeRunning = Math.round(timeRunning);
    return timeRunning = timeRunning + " Minutes";
  } else {
    return timeRunning = timeRunning + " Hours";
  }
}