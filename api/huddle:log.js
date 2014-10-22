/* global Log */
"use strict";

/**
 * Gives us some nice debug convenience functions
 *
 * @author Mario Schreiner
 * @author Roman Rädle
 * @namespace Log
 */
Log = (function() {

  /**
   * true if info mode is on, otherwise false
   */
  var INFO = true;

  var enableInfo = function() {
    INFO = true;
  };


  /**
   * true if error mode is on, otherwise false
   */
  var ERROR = true;

  var enableError = function() {
    ERROR = true;
  };

  /**
   * true if debug mode is on, otherwise false
   */
  var DEBUG = false;

  var enableDebug = function() {
    DEBUG = true;
  };

  /**
   * Logs an info message to the console if debug mode is on
   *
   * @param {string} message the message to log
   *
   * @memberof Log
   */
  var info = function(message) {
    if (INFO) console.log("[INFO]\t" + _getDateString() + " -- " + message);
  };

  /**
   * Logs an error message to the console if debug mode is on
   *
   * @param {string} message the message to log
   *
   * @memberof Log
   */
  var error = function(message) {
    if (ERROR) console.error("[ERROR]\t" + _getDateString() + " -- " + message);
  };

  /**
   * Logs an debug message to the console if debug mode is on
   *
   * @param {string} message the message to log
   *
   * @memberof Log
   */
  var debug = function(message) {
    if (DEBUG) console.log("[DEBUG]\t" + _getDateString() + " -- " + message);
  };

  /**
   * Gets a nicely formatted string of the given date
   *
   * @param {Date} date the date to format into a string. Defaults to the current date.
   * @returns {string} a string describing the date
   *
   * @memberof Log
   */
  var _getDateString = function(date) {
    if (date === undefined) date = new Date();

    var hours = date.getHours();
    hours = (hours.length === 1) ? "0" + hours : hours;

    var minutes = date.getMinutes();
    minutes = (minutes.length === 1) ? "0" + minutes : minutes;

    var seconds = date.getSeconds();
    seconds = (seconds.length === 1) ? "0" + seconds : seconds;

    var milliseconds = date.getMilliseconds();
    milliseconds = (milliseconds.length === 1) ? "00" + milliseconds : milliseconds;
    milliseconds = (milliseconds.length === 2) ? "0" + milliseconds : milliseconds;

    return hours + ":" + minutes + ":" + seconds + "." + milliseconds;
  };

  return {
    enableDebug: enableDebug,
    info: info,
    error: error,
    debug: debug
  };
})();
