
/*
 * GET home page.
 */

io = require('socket.io');

function getInfections() {
  var cities = ["Kinshasa","Mexico City","Istanbul","Paris","St. Petersburg",
    "Johannesburg","Manila","San Francisco","Sao Paulo","Santiago","Chennai",
    "Delhi","Khartoum","Baghdad","Atlanta","Hong Kong","Toronto","Algiers",
    "Tokyo","Miami","Taipei","Beijing","Cairo","Osaka","Washington","Milan",
    "New York","London","Lima","Mumbai","Shanghai","Kolkata","Sydney",
    "Ho Chi Minh City","Seoul","Moscow","Buenos Aires","Bangkok","Los Angeles",
    "Tehran","Karachi","Jakarta","Riyadh","Bogota","Madrid","Lagos","Chicago","Essen"];

  var infections = {};
  var infectedCityIndices = [];

  var numLeftToInfect = 9;
  while(numLeftToInfect > 0) {
    var infectLevel = Math.ceil(numLeftToInfect / 3.0);
    var canidate = Math.floor(Math.random() * cities.length);

    var alreadyInfected = false;
    for (var i = 0; i < infectedCityIndices.length; i++) {
      if (canidate == infectedCityIndices[i]) {
        alreadyInfected = true;
        break;
      }
    }

    console.log(canidate + " " +  cities[canidate] + " " + (alreadyInfected));
    console.log(infectedCityIndices);

    if (!alreadyInfected) {
      infectedCityIndices.push(canidate);
      infections[cities[canidate]] = infectLevel;
      numLeftToInfect = numLeftToInfect - 1;
    }
  }

  return infections;
}

exports.index = function(req, res){
  res.render('index', { title: 'Express' });
};

exports.bootstrapGame = function(req, res){
  var sessionId = req['sessionID'];
  var gameBootstrap = {
    'infectionDeck': [],
    'infectionDiscard': [],
    'playerDeck': [],
    'playerDiscard': [],
    'players': [
      {
        'sessionId': sessionId,
        'role': 'researcher'
      }
    ],
    'currentTurn': sessionId,
    'infections': getInfections()
  };
  res.send(gameBootstrap);
};
