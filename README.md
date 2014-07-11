# Huddle - a client for Huddle Engine

[Huddle](https://bitbucket.org/raedle/meteor-huddle), a client-side JavaScript API to develop mobile and multi-display applications.

## Prerequisites

Install Meteor platform http://www.meteor.com

`$> curl https://install.meteor.com/ | sh`

Use the meteorite package manager http://oortcloud.github.com/meteorite/

`$> [sudo] npm install -g meteorite`

## How to install
1. `$> mrt add huddle`

## How to use

Add Huddle client connection and event handling to your JavaScript file.

Example:

```javascript
if (Meteor.isClient) {

  $(function() {
    var huddle = Huddle.client("MyHuddleName")
      .on("proximity", function(data) {
        var location = data.Location;
        var x = location[0];
        var y = location[1];
        var angle = data.Orientation;

        console.log("X: " + x + ", Y: " + y + ", Angle:" + angle);

        data.Presences.forEach(function(presence) {
            console.log(presence);
        });
      })
      .on("message", function(msg) {
        console.log("Message: " + msg);
      });
    huddle.connect("localhost", 4711);
  });
}
```
