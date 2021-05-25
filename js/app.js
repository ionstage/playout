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

  app.loadImage = function(image) {
    return new Promise(function(resolve, reject) {
      image.onload = function() { resolve(); };
      image.onerror = reject;
      image.src = image.dataset.src;
    });
  };

  app.loadSection = function(el) {
    var images = Array.prototype.slice.call(el.querySelectorAll('img'));
    return Promise.all(images.map(app.loadImage)).finally(function() {
      el.classList.add('visible');
    });
  };

  app.loadSections = function() {
    var sections = Array.prototype.slice.call(document.querySelectorAll('.section'));
    return Promise.all(sections.map(function(section) {
      return app.loadSection(section);
    }));
  };

  // enable hover on touch device
  window.addEventListener('touchstart', function() {});

  window.app = app;
})();
