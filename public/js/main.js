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
        // navigator.geolocation.getCurrentPosition(cb, this.error);
        navigator.geolocation.watchPosition(cb, this.error);
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

    var x = position.coords.latitude, y = position.coords.longitude;


    var socket = io.connect('http://localhost:3000');
    socket.on('news', function (data) {
      console.log(data);
      socket.emit('my other event', { my: 'data' });
    });

  }); // App.init

});
