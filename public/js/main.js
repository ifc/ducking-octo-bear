$(function() {
  var App, Card, City, CityView, REGIONS, World, curedDiseases, currentTurn, infection, infectionRate, infectionRate2numCards, locationId2Cube, log, numOutbreaks, numPlayers, player2SpecialAction, playerBasicActions, playerLocations, playerRoles, playerSpecialActions, researchCenter, world;

  window.Game = this;
  log = console.log;
  infectionRate2numCards = {
    0: 2,
    1: 2,
    2: 2,
    3: 3,
    4: 3,
    5: 4,
    6: 4
  };
  currentTurn = -1;
  numPlayers = 7;
  numOutbreaks = 0;
  infectionRate = 0;
  playerLocations = [4, 59, 3, 4];
  locationId2Cube = {
    1: 0,
    2: 3
  };
  playerRoles = [i, r, s, d];
  curedDiseases = [red, blue];
  infection = {
    location: 1,
    disease: RED
  };
  researchCenter = {
    location: 1,
    disease: BLUE
  };
  playerBasicActions = [DRIVE, DIRECT_FLIGHT, CHARTER_FLIGHT, SHUTTLE_FLIGHT, PASS];
  playerSpecialActions = [DISPATCH, BUILD_RESEARCH_CENTER, DISCOVER_CURE, TREATMENT, SHARE_KNOWLEDGE];
  player2SpecialAction = {
    1: DISPATCH,
    2: BUILD_RESEARCH_CENTER,
    3: TREAT_DISEASE
  };
  REGIONS = {
    YELLOW: {
      "Los Angeles": {
        connections: ["Sydney", "San Francisco", "Chicago", "Mexico City"]
      },
      "Mexico City": {
        connections: ["Los Angeles", "Chicago", "Miami", "Bogota", "Lima"]
      },
      Miami: {
        connections: ["Mexico City", "Atlanta", "Washington", "Bogota"]
      },
      Bogota: {
        connections: ["Mexico City", "Miami", "Sao Paulo", "Buenos Aires", "Lima"]
      },
      Lima: {
        connections: ["Mexico City", "Bogota", "Santiago"]
      },
      Santiago: {
        connections: ["Lima"]
      },
      "Buenos Aires": {
        connections: ["Bogota", "Sao Paulo"]
      },
      "Sao Paulo": {
        connections: ["Bogota", "Madrid", "Lagos", "Buenos Aires"]
      },
      Lagos: {
        connections: ["Sao Paulo", "Khartoum", "Kinshasa"]
      },
      Khartoum: {
        connections: ["Lagos", "Cairo", "Johannesburg", "Kinshasa"]
      },
      Kinshasa: {
        connections: ["Lagos", "Khartoum", "Johannesburg"]
      },
      Johannesburg: {
        connections: ["Kinshasa", "Khartoum"]
      }
    },
    BLACK: {
      Moscow: {
        connections: ["Tehran", "Istanbul", "St. Petersburg"]
      },
      Tehran: {
        connections: ["Moscow", "Baghdad", "Karachi", "Delhi"]
      },
      Istanbul: {
        connections: ["St. Petersburg", "Moscow", "Milan", "Baghdad", "Algiers", "Cairo"]
      },
      Delhi: {
        connections: ["Tehran", "Karachi", "Kolkata", "Mumbai", "Chennai"]
      },
      Baghdad: {
        connections: ["Tehran", "Istanbul", "Karachi", "Cairo", "Riyadh"]
      },
      Karachi: {
        connections: ["Tehran", "Delhi", "Baghdad", "Riyadh", "Mumbai"]
      },
      Kolkata: {
        connections: ["Delhi", "Chennai", "Bangkok", "Hong Kong"]
      },
      Algiers: {
        connections: ["Madrid", "Paris", "Istanbul", "Cairo"]
      },
      Cairo: {
        connections: ["Algiers", "Istanbul", "Baghdad", "Riyadh", "Khartoum"]
      },
      Riyadh: {
        connections: ["Cairo", "Baghdad", "Karachi"]
      },
      Mumbai: {
        connections: ["Karachi", "Delhi", "Chennai"]
      },
      Chennai: {
        connections: ["Mumbai", "Delhi", "Kolkata", "Bangkok", "Jakarta"]
      }
    },
    RED: {
      Beijing: {
        connections: ["Shanghai", "Seoul"]
      },
      Seoul: {
        connections: ["Beijing", "Shanghai", "Tokyo"]
      },
      Tokyo: {
        connections: ["Shanghai", "Seoul", "Osaka", "San Francisco"]
      },
      Shanghai: {
        connections: ["Beijing", "Seoul", "Tokyo", "Taipei", "Hong Kong"]
      },
      Osaka: {
        connections: ["Tokyo", "Taipei"]
      },
      Taipei: {
        connections: ["Shanghai", "Osaka", "Hong Kong", "Manila"]
      },
      "Hong Kong": {
        connections: ["Kolkata", "Shanghai", "Taipei", "Manila", "Ho Chi Minh City", "Bangkok"]
      },
      Bangkok: {
        connections: ["Kolkata", "Chennai", "Hong Kong", "Ho Chi Minh City", "Jakarta"]
      },
      "Ho Chi Minh City": {
        connections: ["Jakarta", "Bangkok", "Hong Kong", "Manila"]
      },
      Manila: {
        connections: ["Ho Chi Minh City", "Hong Kong", "Taipei", "San Francisco", "Sydney"]
      },
      Jakarta: {
        connections: ["Chennai", "Bangkok", "Ho Chi Minh City", "Sydney"]
      },
      Sydney: {
        connections: ["Jakarta", "Manila", "Los Angeles"]
      }
    },
    BLUE: {
      "San Francisco": {
        connections: ["Tokyo", "Manila", "Chicago", "Los Angeles"]
      },
      Chicago: {
        connections: ["San Francisco", "Los Angeles", "Mexico City", "Atlanta", "Toronto"]
      },
      Toronto: {
        connections: ["Chicago", "New York", "Washington"]
      },
      "New York": {
        connections: ["Toronto", "Washington", "London", "Madrid"]
      },
      Washington: {
        connections: ["Atlanta", "Toronto", "New York", "Miami"]
      },
      Atlanta: {
        connections: ["Chicago", "Washington", "Miami"]
      },
      London: {
        connections: ["New York", "Essen", "Madrid", "Paris"]
      },
      Essen: {
        connections: ["London", "Paris", "Milan", "St. Petersburg"]
      },
      "St. Petersburg": {
        connections: ["Essen", "Istanbul", "Moscow"]
      },
      Madrid: {
        connections: ["New York", "London", "Paris", "Sao Paulo", "Algiers"]
      },
      Paris: {
        connections: ["Madrid", "London", "Essen", "Milan", "Algiers"]
      },
      Milan: {
        connections: ["Paris", "Essen", "Istanbul"]
      }
    }
  };
  world = new World({
    Regions: REGIONS
  });
  World = Backbone.Model.extend({
    initialize: function(options) {
      return initGraph();
    },
    initGraph: function() {
      this._internal = {};
      return _.each(this.Regions, function(Region) {
        return _.each(Region, function(City, name) {
          this._internal[name] = City;
          return City.initConnections();
        });
      });
    }
  });
  Card = Backbone.Model.extend({
    tagName: "div",
    className: "card",
    template: ""
  });
  City = Backbone.Model.extend({
    initialize: function() {
      this.set("researchCenter", 0);
      return this.set("diseaseCubes", 0);
    },
    initConnections: function() {
      return _.each(this.get("connections"), function() {});
    },
    infect: function() {
      this.addDiseaseCubes(1);
      if (this.get("diseaseCubes") > 3) {
        return _.each(this.get("connections"), function() {
          return connections.infect();
        });
      }
    },
    addDiseaseCubes: function(num) {
      return this.set("diseaseCubes", this.get("diseaseCubes") + num);
    }
  });
  CityView = Backbone.View.extend({
    tagName: "div",
    className: "cityview",
    render: function() {}
  });
  App = {
    init: function(cb) {
      if (navigator.geolocation) {
        return navigator.geolocation.watchPosition(cb, this.error);
      } else {
        return error("not supported");
      }
    },
    error: function(msg) {
      return log(msg);
    }
  };
  return App.init(function(position) {
    var socket, x, y;

    if ($("#status").hasClass("success")) {
      return;
    }
    x = position.coords.latitude;
    y = position.coords.longitude;
    socket = io.connect("http://localhost:3000");
    socket.on("news", function(data) {
      console.log(data);
      return socket.emit("my other event", {
        my: "data"
      });
    });
    return startGame();
  });
});
