# Huddle - turn your phones and tablets into an improvised interactive table

Huddle is a client-side JavaScript API to develop multi-device and multi-display applications. It allows you to turn arbitrary tables or flat surfaces into an interactive surface. To get a basic idea of what Huddle allows you to create with a tabletop of mobile devices, look at the [demo video](http://youtu.be/XkmwG588zp0) on YouTube.

<a href="http://www.youtube.com/watch?v=XkmwG588zp0" target="_blank" alt="HuddleLamp: Spatially-Aware Mobile Displays for Ad-hoc Around-the-Table Collaboration">
  <img src="http://raedle.github.io/HuddleLamp-YouTube.png" alt="HuddleLamp: Spatially-Aware Mobile Displays for Ad-hoc Around-the-Table Collaboration" />
</a>

In order to achieve this, a tracking engine is required. One incarnation of such a tracking engine is [HuddleLamp](http://huddlelamp.org). HuddleLamp is a desk lamp with an integrated low cost depth camera (e.g. the Creative Senz3d by Intel). It enables users to compose interactive tables (or other multi-device user interfaces) from their tablets and smart phones just by putting them under this desk lamp. HuddleLamp tracks multiple mobile devices on a table, automatically identifies them, and sends their location and orientation and the location and orientation of neighbouring devices as proximity data to each device. Find detailed information on the required hardware and tracking software on our [HuddleLamp](http://huddlelamp.org) website.

Want to look at an example of a complete, basic app using Huddle JavaScript API? Try the simple [peephole](http://peephole.huddlelamp.org) application.

The two additional packages [huddle:canvas](https://atmospherejs.com/scarrobin/huddlecanvas) and [huddle:object](https://atmospherejs.com/jay5/huddleobject) offer more high-level APIs to develop cross-device applications that share a single large virtual canvas.

## Developing Huddle Apps with HuddleOrbiter - a Huddle Tracking Simulator
You don't have the required hardware yet? No worries! We provide [HuddleOrbiter](http://orbiter.huddlelamp.org), a web-based simulator that enables development of Huddle apps without the need to have a working tracking engine. You can start to develop and test Huddle apps now and switch to the HuddleLamp tracking engine later. Both HuddleOrbiter and HuddleLamp speak the same protocol and they can be used interchangeably. By this, developers can switch back and forth between the web-based simulator and real multi-display tracking.

## Prerequisites

Install Meteor platform http://www.meteor.com

`$ curl https://install.meteor.com/ | sh`

## How to Install Huddle JavaScript API

1. `$ meteor create myhuddle-app`
2. `$ cd myhuddle-app`
3. `$ meteor add huddle:client`
4. Add optional packages [huddle:canvas](https://atmospherejs.com/scarrobin/huddlecanvas) and [huddle:object](https://atmospherejs.com/jay5/huddleobject).

##### Current Build Status
[![Build Status](https://travis-ci.org/raedle/meteor-huddle.svg?branch=master)](https://travis-ci.org/raedle/meteor-huddle)

### Connect Devices to HuddleOrbiter or HuddleLamp
This JavaScript example code (myhuddle-app.js) examplifies the usage of the Huddle JavaScript API. It creates a Huddle client and registers function callbacks on incoming proximity data, devicefound and devicelost events, and incoming client messages. In the proximity callback function it prints devices' x- and y-location and orientation in the console. In addition it prints the data object for each neighbouring device, if any, in the console. When a device is tracked, the devicefound function is called and devicelost when the device gets lost. Huddle clients can also receive messages (in JSON format) from other connected clients. An example on how to send messages is below.

```javascript
if (Meteor.isClient) {
  var huddleClient = Huddle.client()
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
  huddleClient.connect("orbiter.huddlelamp.org", <YOUR_ASSIGNED_HUDDLE_ORBITER_PORT>);
}
```

### Proximity Data - Device Location and Orientation
A Huddle client handles the connection to a Huddle tracking engine through a web socket connection. It offers properties to automatically reconnect on connection errors. The device will get a continues stream of proximity data if a connection to Huddle engine is established. An example on how the `Proximity` data object looks like is below.

```
{
  Type: "TYPE",               // a string e.g., Device or Hand
  Identity: "IDENTITY",       // a string that represents the Huddle id
  Location: double[3],        // values are [0;1], Location[0] = x, Location[1] = y, Location[2] = z (in current tracking the z-value is always 0.0)
  Orientation: double,        // value is [0;360]
  Distance: double,           // value is [0;1] and only set for presences in Presences property.
  Movement: double,           // not yet implemented
  Presences: Proximity[],     // Neighbouring devices proximity data
  RgbImageToDisplayRatio: {   // The aspect ratio on how many times a device's screen fits into the tracked region providing independent values for X- and Y-axis
                            X: double,
                            Y: double
                          },
}
```

### Broadcast Messages - Device to Devices Communication
Huddle clients also can communicate with each other through broadcast message. A simple example of a message broadcast is shwon below. This example works with the client above.

```javascript
anotherHuddleClient.broadcast("myMessage", { yell: "Hut! Hut! Hut!" });
```

## Example Using HuddleOrbiter

1. Add Huddle client connection and event handling to your myhuddle-app.js file (see example below).
2. Go to [http://orbiter.huddlelamp.org](http://orbiter.huddlelamp.org) and log in to your account or create an account if you are a first time user.
3. Get the port that was assigned with your HuddleOrbiter account and replace `<YOUR_ASSIGNED_HUDDLE_ORBITER_PORT>` with your port in the JavaScript snippet added before under point 1.
4. Run meteor: `$ meteor`
5. Open [http://localhost:3000](http://localhost:3000) and the Huddle client will connect to your HuddleOrbiter account. If successful, the device will appear under the Orbit tab in the HuddleOrbiter. A second device will appear if you open [http://localhost:3000](http://localhost:3000) again in a second browser tab or second browser window. Continue with device 3 and so on.
6. Now the Huddle clients receive proximity data.
7. Enjoy it or not. Give us feedback in both cases! ;)

## License
This software is released under MIT license. Copyright is held by HuddleLamp and refers to the authors of this package, namely Roman Rädle and Hans-Christian Jetter.

The MIT License (MIT)

Copyright (c) 2014 HuddleLamp

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
