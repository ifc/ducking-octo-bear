
/*
 * GET home page.
 */

io = require('socket.io');

exports.index = function(req, res){
  res.render('index', { title: 'Express' });
};