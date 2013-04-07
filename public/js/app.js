$(function() {
  return Backbone.on('fully-defined', function() {
    var App, initLogic, playTurn;

    alert('here');
    App = {
      init: function(cb) {
        if (navigator.geolocation) {
          navigator.geolocation.watchPosition(cb, this.error);
        } else {
          error("not supported");
        }
        $('#right-panel-toggle').click(function(e) {
          $(e.currentTarget).toggleClass('red');
          return $('#right-panel').toggle();
        });
        return App.World = new World({
          Regions: REGIONS
        });
      },
      error: function(msg) {
        return log(msg);
      },
      bootstrap: function(data) {
        var right_panel;

        log(data);
        console.log('here');
        if (App.started) {
          return;
        }
        right_panel = new RightPanel({
          model: World
        });
        return initLogic(data);
      },
      playTurn: function(data) {
        return playTurn(data);
      }
    };
    App.init(function(position) {
      var socket;

      if (App.succeeded) {
        return;
      }
      App.succeeded = true;
      socket = io.connect("http://localhost:3000");
      App.Socket = socket;
      socket.on("boostrap", function(data) {
        App.bootstrap(data);
        return App.started = true;
      });
      return socket.on("message", function(data) {
        return App.playTurn(data);
      });
    });
    initLogic = function(data) {};
    return playTurn = function(data) {};
  });
});
