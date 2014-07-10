Package.describe({
  summary: "Huddle - a client-side JavaScript API to develop novel mobile and multi-display applications."
});

Package.on_use(function (api) {
  api.use('jquery', 'client');
  api.imply('jquery', 'client');
  api.add_files([
    'huddle.js'
  ], 'client'
  );
});
