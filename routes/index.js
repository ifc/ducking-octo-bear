
/*
 * GET home page.
 */

io = require('socket.io');

//http://stackoverflow.com/questions/2450954/how-to-randomize-a-javascript-array
function fisherYates (myArray) {
  var i = myArray.length, j, tempi, tempj;
  if (i === 0)
    return false;
  while ( --i ) {
     j = Math.floor( Math.random() * ( i + 1 ) );
     tempi = myArray[i];
     tempj = myArray[j];
     myArray[i] = tempj;
     myArray[j] = tempi;
  }
}

function getInfectionDeck() {
  var cities = ["Kinshasa","Mexico City","Istanbul","Paris","St. Petersburg",
    "Johannesburg","Manila","San Francisco","Sao Paulo","Santiago","Chennai",
    "Delhi","Khartoum","Baghdad","Atlanta","Hong Kong","Toronto","Algiers",
    "Tokyo","Miami","Taipei","Beijing","Cairo","Osaka","Washington","Milan",
    "New York","London","Lima","Mumbai","Shanghai","Kolkata","Sydney",
    "Ho Chi Minh City","Seoul","Moscow","Buenos Aires","Bangkok","Los Angeles",
    "Tehran","Karachi","Jakarta","Riyadh","Bogota","Madrid","Lagos","Chicago","Essen"];
  fisherYates(cities);
  return cities;
}

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

    if (!alreadyInfected) {
      infectedCityIndices.push(canidate);
      infections[cities[canidate]] = infectLevel;
      numLeftToInfect = numLeftToInfect - 1;
    }
  }

  return infections;
}

function getPlayerDeck(numPlayers, numEpidemicCards) {
  // Could add the action cards here. ie "Action: blah".
  var deck = ["Kinshasa","Mexico City","Istanbul","Paris","St. Petersburg",
    "Johannesburg","Manila","San Francisco","Sao Paulo","Santiago","Chennai",
    "Delhi","Khartoum","Baghdad","Atlanta","Hong Kong","Toronto","Algiers",
    "Tokyo","Miami","Taipei","Beijing","Cairo","Osaka","Washington","Milan",
    "New York","London","Lima","Mumbai","Shanghai","Kolkata","Sydney",
    "Ho Chi Minh City","Seoul","Moscow","Buenos Aires","Bangkok","Los Angeles",
    "Tehran","Karachi","Jakarta","Riyadh","Bogota","Madrid","Lagos","Chicago","Essen"];

  // Shuffle the deck.
  fisherYates(deck);

  var ret = {"deck": [], "playerCards": []};
  var numCardsPerPlayer = {
    1: 4,
    2: 4,
    3: 3,
    4: 2
  }[numPlayers];

  // Pick the first few cards for each player.
  for (var i = 0; i < numPlayers; i++) {
    var playerCards = [];
    for (var j = 0; j < numCardsPerPlayer; j++)
      playerCards.push(deck.splice(0, 1)[0]);
    ret['playerCards'].push(playerCards);
  }

  // Now insert the epidemic cards (roughly one per 'bucket').
  var bucketSize = Math.floor(deck.length);
  for (i = 0; i < numEpidemicCards; i++) {
    var epiLocation = Math.floor((bucketSize * i) + Math.random() * bucketSize);
    deck.splice(epiLocation, 0, "EPIDEMIC!");
  }
  ret['deck'] = deck;

  return ret;
}


exports.index = function(req, res){
  res.render('index', { title: 'Express' });
};

exports.bootstrap = function(req, res){
  var sessionId = req['sessionID'];
  var playerSessionIds = [sessionId];

  var playerCards = getPlayerDeck(playerSessionIds.length);
  var players = [];
  for (var i = 0; i < playerSessionIds.length; i++) {
    players.push({
      'sessionId': playerSessionIds[i],
      'role': 'researcher',
      'location': 'Atlanta',
      'cards': playerCards['playerCards'][i]
    });
  }

  var gameBootstrap = {
    'infectionDeck': getInfectionDeck(),
    'infectionDiscard': [],
    'playerDeck': playerCards['deck'],
    'playerDiscard': [],
    'players': players,
    'currentTurn': sessionId,
    'infections': getInfections()
  };
  res.send(gameBootstrap);
};
