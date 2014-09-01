# Huddle - a client for Huddle Engine

[Huddle](https://bitbucket.org/raedle/meteor-huddle), a client-side JavaScript API to develop mobile and multi-display applications.

## Prerequisites

Install Meteor platform http://www.meteor.com

`$ curl https://install.meteor.com/ | sh`

## How to install

1. `$ meteor create myhuddle-app`
2. `$ cd myhuddle-app`
3. `$ meteor add raedle:huddle`

## How to use with HuddleOrbiter
1. Add Huddle client connection and event handling to your `myhuddle-app.js` file (see example below).
2. Go to `http://huddle-orbiter.proxemicinteractions.org:3000` log in to your account or create an account if you are a first time user.
3. Get the port that was assigned with your HuddleOrbiter account and add it to the JavaScript snippet added before under point 1.
4. `$ meteor`
5. Open `http://localhost:3000` and the Huddle client will connect to your HuddleOrbiter account. If successful, the device will appear under the Orbit tab in the HuddleOrbiter. A second device will appear if you open `http://localhost:3000` again in a different browser tab or new browser window. Continue with device 3 and so on.
6. Now the Huddle client receives proximity data that you can work with.
7. Enjoy or if you don't then give us feedback!

Example:

```javascript
if (Meteor.isClient) {
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
    .on("devicefound", function() {
      console.log("devicefound");
    })
    .on("devicelost", function() {
      console.log("devicelost");
    })
    .on("myMessage", function(msg) {
      // this will print messages sent with broadcast function. See example below '{yell:"Hut! Hut! Hut!"}'
      console.log("Message: " + msg);
    });
  huddle.connect("huddle-orbiter.proxemicinteractions.org", <YOUR_ASSIGNED_HUDDLE_ORBITER_PORT>);
}
```

Huddle clients also can communicate with each other through broadcast message. A simple example of a message broadcast is shwon below. This example works with the client above.

```javascript
anotherHuddle.broadcast("myMessage", { yell: "Hut! Hut! Hut!" });
```
