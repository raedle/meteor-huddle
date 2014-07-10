# Huddle - a client for Huddle Engine

[Huddle](https://bitbucket.org/raedle/meteor-huddle) v0.9.10, a client-side JavaScript API to develop novel mobile and multi-display applications.

## How to install
1. `npm install -g meteorite` (if not already installed)
2. `mrt add huddle`
3. For the simplest invocation, call `Huddle.client("MyHuddle").on("proximity", function(data) { console.log(data) };).connect("localhost", 4711);` in document ready event.
