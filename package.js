Package.describe({
  name: 'huddle:client',
  summary: "Huddle - a client-side JavaScript API to develop novel mobile and multi-display applications.",
  version: "0.9.14",
  git: "https://github.com/raedle/meteor-huddle.git"
});

Package.onUse(function(api) {
  api.versionsFrom('METEOR@0.9.0');

  // used external packages
  api.use('jquery', 'client');

  // allow referencing packages to use jQuery
  api.imply('jquery', 'client');

  // export Huddle object on client side
  api.export('Common', 'client');
  api.export('Log', 'client');
  api.export('EventManager', 'client');
  api.export('Huddle', 'client');

  // Huddle API files
  api.addFiles('api/huddle:common.js', 'client');
  api.addFiles('api/huddle:log.js', 'client');
  api.addFiles('api/huddle:eventmanager.js', 'client');
  api.addFiles('api/huddle:client.js', 'client');
});

Package.onTest(function(api) {
  api.use('tinytest');
  api.use('huddle:core');
  api.addFiles('test/huddle:core-tests.js');
});
