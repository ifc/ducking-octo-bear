$(function() {

  // Keep reference to Context
  window.Game = this;

  //
  // Definitions
  //
  var log = console.log;

  var infectionRate2numCards = {
    0: 2,
    1: 2,
    2: 2,
    3: 3,
    4: 3,
    5: 4,
    6: 4
  };

  // Game State

  var currentTurn = -1; // 1 to numPlayers
  var numPlayers = 7; // 1 to 7
  var numOutbreaks = 0;
  var infectionRate = 0;
  var playerLocations = [4, 59, 3, 4];
  var locationId2Cube = {
    1: 0,
    2: 3
  };
  var playerRoles = [i, r, s, d];
  var curedDiseases = [red, blue];

  var infection = {
    location: 1,
    disease: RED
  };
  var researchCenter={
    location: 1,
    disease: BLUE
  };
  var playerBasicActions = [DRIVE, DIRECT_FLIGHT, CHARTER_FLIGHT, SHUTTLE_FLIGHT, PASS];
  var playerSpecialActions = [DISPATCH,BUILD_RESEARCH_CENTER, DISCOVER_CURE, TREATMENT, SHARE_KNOWLEDGE];
  var player2SpecialAction = {
    1: DISPATCH,
    2: BUILD_RESEARCH_CENTER,
    3: TREAT_DISEASE
  };

  // Cities are Backbone objects
  var REGIONS = {
    "YELLOW": {
      "Los Angeles": {connections: ["Sydney", "San Francisco", "Chicago", "Mexico City"]},
      "Mexico City": {connections: ["Los Angeles", "Chicago", "Miami", "Bogota", "Lima"]},
      "Miami": {connections: ["Mexico City", "Atlanta", "Washington", "Bogota"]},
      "Bogota": {connections: ["Mexico City", "Miami", "Sao Paulo", "Buenos Aires", "Lima"]},
      "Lima": {connections: ["Mexico City", "Bogota", "Santiago"]},
      "Santiago": {connections: ["Lima"]},
      "Buenos Aires": {connections: ["Bogota", "Sao Paulo"]},
      "Sao Paulo": {connections: ["Bogota", "Madrid", "Lagos", "Buenos Aires"]},
      "Lagos": {connections: ["Sao Paulo", "Khartoum", "Kinshasa"]},
      "Khartoum": {connections: ["Lagos", "Cairo", "Johannesburg", "Kinshasa"]},
      "Kinshasa": {connections: ["Lagos", "Khartoum", "Johannesburg"]},
      "Johannesburg": {connections: ["Kinshasa", "Khartoum"]}
    },
    "BLACK": {
      "Moscow": {connections: ["Tehran", "Istanbul", "St. Petersburg"]},
      "Tehran": {connections: ["Moscow", "Baghdad", "Karachi", "Delhi"]},
      "Istanbul": {connections: ["St. Petersburg", "Moscow", "Milan", "Baghdad", "Algiers", "Cairo"]},
      "Delhi": {connections: ["Tehran", "Karachi", "Kolkata", "Mumbai", "Chennai"]},
      "Baghdad": {connections: ["Tehran", "Istanbul", "Karachi", "Cairo", "Riyadh"]},
      "Karachi": {connections: ["Tehran", "Delhi", "Baghdad", "Riyadh", "Mumbai"]},
      "Kolkata": {connections: ["Delhi", "Chennai", "Bangkok", "Hong Kong"]},
      "Algiers": {connections: ["Madrid", "Paris", "Istanbul", "Cairo"]},
      "Cairo": {connections: ["Algiers", "Istanbul", "Baghdad", "Riyadh", "Khartoum"]},
      "Riyadh": {connections: ["Cairo", "Baghdad", "Karachi"]},
      "Mumbai": {connections: ["Karachi", "Delhi", "Chennai"]},
      "Chennai": {connections: ["Mumbai", "Delhi", "Kolkata", "Bangkok", "Jakarta"]}
    },
    "RED": {
      "Beijing": {connections: ["Shanghai", "Seoul"]},
      "Seoul": {connections: ["Beijing", "Shanghai", "Tokyo"]},
      "Tokyo": {connections: ["Shanghai", "Seoul", "Osaka", "San Francisco"]},
      "Shanghai": {connections: ["Beijing", "Seoul", "Tokyo", "Taipei", "Hong Kong"]},
      "Osaka": {connections: ["Tokyo", "Taipei"]},
      "Taipei": {connections: ["Shanghai", "Osaka", "Hong Kong", "Manila"]},
      "Hong Kong": {connections: ["Kolkata", "Shanghai", "Taipei", "Manila", "Ho Chi Minh City", "Bangkok"]},
      "Bangkok": {connections: ["Kolkata", "Chennai", "Hong Kong", "Ho Chi Minh City", "Jakarta"]},
      "Ho Chi Minh City": {connections: ["Jakarta", "Bangkok", "Hong Kong", "Manila"]},
      "Manila": {connections: ["Ho Chi Minh City", "Hong Kong", "Taipei", "San Francisco", "Sydney"]},
      "Jakarta": {connections: ["Chennai", "Bangkok", "Ho Chi Minh City", "Sydney"]},
      "Sydney": {connections: ["Jakarta", "Manila", "Los Angeles"]}
    },
    "BLUE": {
      "San Francisco": {connections: ["Tokyo", "Manila", "Chicago", "Los Angeles"]},
      "Chicago": {connections: ["San Francisco", "Los Angeles", "Mexico City", "Atlanta", "Toronto"]},
      "Toronto": {connections: ["Chicago", "New York", "Washington"]},
      "New York": {connections: ["Toronto", "Washington", "London", "Madrid"]},
      "Washington": {connections: ["Atlanta", "Toronto", "New York", "Miami"]},
      "Atlanta": {connections: ["Chicago", "Washington", "Miami"]},
      "London": {connections: ["New York", "Essen", "Madrid", "Paris"]},
      "Essen": {connections: ["London", "Paris", "Milan", "St. Petersburg"]},
      "St. Petersburg": {connections: ["Essen", "Istanbul", "Moscow"]},
      "Madrid": {connections: ["New York", "London", "Paris", "Sao Paulo", "Algiers"]},
      "Paris": {connections: ["Madrid", "London", "Essen", "Milan", "Algiers"]},
      "Milan": {connections: ["Paris", "Essen", "Istanbul"]}
    }
  };

  // World creates a basic graph from
  // cities and updates.
  var world = new World({
    Regions: REGIONS
  });

  var World = Backbone.Model.extend({
    initialize: function(options) {
      initGraph();
    },
    // Link to cities for each
    initGraph: function() {
      this._internal = {};
      _.each(this.Regions, function(Region) {
          _.each(Region, function(City, name) {
          this._internal[name] = City;
          City.initConnections();
        });
      });
    }
  });

  var Card = Backbone.Model.extend({
    tagName: 'div',
    className: 'card',
    template: ''
  });

  var City = Backbone.Model.extend({
    initialize: function() {
      this.set("researchCenter", 0);
      this.set("diseaseCubes", 0);
    },
    initConnections: function() {
      _.each(this.get("connections"), function() {

      });
    },
    infect: function() {
      this.addDiseaseCubes(1);
      if(this.get("diseaseCubes") > 3) {
        _.each(this.get("connections"), function() {
          connections.infect();
        });
      }
    },
    addDiseaseCubes: function(num) {
      this.set("diseaseCubes", this.get("diseaseCubes")+num);
    }
  });

  var CityView = Backbone.View.extend({
    tagName: 'div',
    className: 'cityview',
    render: function() {

    }
  });

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

    startGame();

  }); // App.init

});


