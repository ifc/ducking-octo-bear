$(function() {
  //
  // Renaming
  //

  var log = console.log;

  //
  // Async bootstrap
  //

  var App = {
    init: function(cb) {
    // Geo locate
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(cb, this.error);
      } else {
        error('not supported');
      }
    },
    error: function(msg) {
      log(msg);
    }
  };

  //
  // App
  //

  App.init(function(position) {
    // Start logic

    if ($('#status').hasClass('success')) {
      // not sure why we're hitting this twice in FF,
      // I think it's to do with a cached result coming back
      return;
    }

    var x = position.coords.latitude,
        y = position.coords.longitude;
    console.log(x, y);

    $('#stage').html(x + " " + y);

  }); // App.init

});
