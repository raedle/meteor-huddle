/**
 * Helper function to use string format, e.g., as known from C#
 * var awesomeWorld = "Hello {0}! You are {1}.".format("World", "awesome");
 *
 * TODO Enclose the format prototype function in HuddleClient JavaScript API.
 * Source: http://stackoverflow.com/questions/1038746/equivalent-of-string-format-in-jquery
 */
String.prototype.format = function () {
    var args = arguments;
    return this.replace(/\{\{|\}\}|\{(\d+)\}/g, function (m, n) {
        if (m == "{{") { return "{"; }
        if (m == "}}") { return "}"; }
        return args[n];
    });
};

/* global Log */
"use strict";

/**
 * Common functions.
 *
 * @author Roman Rädle
 * @namespace Common
 */
Common = (function() {

  this.getDeviceType = function() {
    var type = navigator.userAgent.match(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i);

    var deviceType = 'unknown';
    if (type) {
        deviceType = type[0];
    }

    return deviceType;
  };

  return this;
})();
