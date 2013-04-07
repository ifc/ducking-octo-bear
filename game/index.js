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
  var bucketSize = Math.floor(deck.length) / numEpidemicCards;
  for (i = 0; i < numEpidemicCards; i++) {
    var epiLocation = Math.floor((bucketSize * i) + Math.random() * bucketSize);
    deck.splice(epiLocation, 0, "EPIDEMIC!");
  }
  ret['deck'] = deck;

  return ret;
}


function getBootstrapObject(sessionId) {
  var playerSessionIds = [sessionId];

  // For now, just 5 epidemic cards.
  var playerCards = getPlayerDeck(playerSessionIds.length, 5);
  var players = [];
  for (var i = 0; i < playerSessionIds.length; i++) {
    players.push({
      'clientId': playerSessionIds[i],
      'role': 'researcher',
      'location': 'Atlanta',
      'cards': playerCards['playerCards'][i]
    });
  }

  return {
    'clientId': sessionId,
    'infectionDeck': getInfectionDeck(),
    'infectionDiscard': [],
    'playerDeck': playerCards['deck'],
    'playerDiscard': [],
    'players': players,
    'currentTurn': sessionId,
    'infections': getInfections()
  };
}

function onEndTurn(data) {
  console.log('==========================');
  console.log('endTurn got data => ', data);
  console.log('==========================');
}

function onMessage(data) {
  console.log('==========================');
  console.log('onMessage got data => ', data);
  console.log('==========================');
}

module.exports = function(app) {

  // Game logic here
  var io = require('socket.io').listen(app);

  // Socket.IO
  io.sockets.on('connection', function(socket) {
    socket.emit('bootstrap', getBootstrapObject(socket.id));

    socket.on('message', onMessage);
    socket.on('endTurn', onEndTurn);
  });

};
