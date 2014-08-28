Package.describe({
  summary: "Huddle - a client-side JavaScript API to develop novel mobile and multi-display applications.",
  version: "0.9.7",
  git: "https://github.com/raedle/meteor-huddle.git"
});

Package.onUse(function(api) {
  api.versionsFrom('METEOR@0.9.0');

  api.use('jquery', 'client');

  api.imply('jquery', 'client');

  api.export('Huddle', 'client');

  api.addFiles('raedle:huddle.js', 'client');
});
