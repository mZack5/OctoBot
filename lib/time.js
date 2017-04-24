"use strict";

/*
*
* Module to take the time a print has been running, (in seconds)
* and return that time in minutes or hours, depending on the time.
*
*/


exports.getTimeRunning = (timeRunning) => {
  timeRunning = timeRunning / 60 / 60;
  if (timeRunning < 1) {
    timeRunning = timeRunning * 60;
    timeRunning = +timeRunning.toFixed(2);
    return timeRunning = timeRunning + " Minutes";
  } else {
      timeRunning = +timeRunning.toFixed(2);
    return timeRunning = timeRunning + " Hours";
  }
}
