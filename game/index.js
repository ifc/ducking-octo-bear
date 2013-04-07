module.exports = function(app) {

  // Game logic here
  var mongoose = require('mongoose'),
      io = require('socket.io').listen(app);

  // Mongoose
  mongoose.connect('mongodb://localhost/test');

  var User = mongoose.Schema({
    name: String,
    cards: Object
  });

  var gameSchema = mongoose.Schema({
    name: String
    // define other saves here
  });

  // Socket.IO
  io.sockets.on('connection', function(socket) {
    socket.emit('news', { hello: 'world'});
    socket.on('my other event', function (data) {
      console.log(data);
    });
  });

};