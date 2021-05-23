(function() {
  'use strict';

  var WebFont = require('webfontloader');

  var app = {};

  app.loadFont = function(name) {
    return new Promise(function(resolve, reject) {
      WebFont.load({
        google: { families: [name] },
        active: resolve,
        inactive: reject,
      });
    });
  };

  window.app = app;
})();
