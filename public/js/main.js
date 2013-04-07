$(function() {
  var App, BLACK, BLUE, BUILD_RESEARCH_CENTER, CHARTER_FLIGHT, Card, CardView, City, CityCollection, CityView, DIRECT_FLIGHT, DISCOVER_CURE, DISPATCH, DRIVE, PASS, RED, REGIONS, RightPanel, SHARE_KNOWLEDGE, SHUTTLE_FLIGHT, TREAT_DISEASE, World, YELLOW, createLine, curedDiseases, currentTurn, infection, infectionRate, infectionRate2numCards, locationId2Cube, log, numOutbreaks, numPlayers, player2SpecialAction, playerBasicActions, playerLocations, playerRoles, playerSpecialActions, researchCenter;

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
  playerRoles = {
    Medic: {
      description: "Removes all cubes of a single color when you treat a city,\nAdminister known cures for free"
    },
    Researcher: {
      description: "You may give a player cards from your hand for 1 action per card.\nBoth of your pawns must be in the same city, but it doesn't matter which city you are in"
    },
    Scientist: {
      description: "You only need 4 cards of the same color to discover a cure"
    },
    Dispatcher: {
      description: "Move your fellow players' pawns on your turn as if they were your own.\nMove any pawn to another city containing a pawn for 1 action."
    },
    Operations: {
      description: "You may build a Research Station in your current city for one action.\nOnce per turn at a research station you may spend an action and discard any city card to move to any city"
    }
  };
  curedDiseases = [];
  RED = 1;
  BLUE = 2;
  YELLOW = 3;
  BLACK = 4;
  DRIVE = 1;
  DIRECT_FLIGHT = 2;
  CHARTER_FLIGHT = 3;
  SHUTTLE_FLIGHT = 4;
  PASS = 5;
  DISPATCH = 1;
  BUILD_RESEARCH_CENTER = 2;
  DISCOVER_CURE = 3;
  TREAT_DISEASE = 4;
  SHARE_KNOWLEDGE = 5;
  infection = {
    location: 1,
    disease: RED
  };
  researchCenter = {
    location: 1,
    disease: BLUE
  };
  playerBasicActions = [DRIVE, DIRECT_FLIGHT, CHARTER_FLIGHT, SHUTTLE_FLIGHT, PASS];
  playerSpecialActions = [DISPATCH, BUILD_RESEARCH_CENTER, DISCOVER_CURE, TREAT_DISEASE, SHARE_KNOWLEDGE];
  player2SpecialAction = {
    1: DISPATCH,
    2: BUILD_RESEARCH_CENTER,
    3: TREAT_DISEASE
  };
  createLine = function(x1, y1, x2, y2) {
    var angle, length, line, transform;

    length = Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2));
    angle = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;
    transform = "rotate(" + angle + "deg)";
    line = $("<div>").appendTo("body").addClass("line").css({
      position: "absolute",
      transform: transform
    }).width(length).offset({
      left: x1,
      top: y1
    });
    return line;
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
  World = Backbone.Model.extend({
    initialize: function(options) {
      return initGraph();
    },
    initGraph: function() {
      this.Cities = {};
      return _.each(this.Regions, function(Region) {
        return _.each(Region, function(City, name) {
          this.Cities[name] = City;
          return City.initConnections();
        });
      });
    }
  });
  Card = Backbone.Model.extend;
  CardView = Backbone.Model.extend({
    tagName: "div",
    className: "card",
    __template: "<div class=\"title\">\n  <div class=\"sphere {{color}} pull-left\"></div>\n</div>\n<div class=\"name\">\n  {{name}}\n</div>\n<div class=\"map\">\n  &nbsp;\n</div>\n<div class=\"footer\">\n  <div class=\"sphere {{color}} pull-right\"></div>\n</div>",
    template: function(c) {
      return Mustache.render(this.__template, c);
    },
    render: function() {
      return this.$el.html(this.template(_.result(this, 'context')));
    },
    context: function() {
      return {
        name: '',
        color: ''
      };
    }
  });
  City = Backbone.Model.extend({
    initialize: function() {
      this.set("researchCenter", 0);
      return this.set("diseaseCubes", 0);
    },
    initConnections: function() {
      var connections;

      return connections = _.map(this.get("connections"), function(name) {
        return App.World.Cities[name];
      });
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
  CityCollection = Backbone.Model.extend({
    model: City
  });
  CityView = Backbone.View.extend({
    tagName: "div",
    className: "cityview",
    __template: "<div class=\"sphere {{color}}\"></div>",
    template: function(c) {
      return Mustache.render(this.__template, c);
    },
    render: function() {
      return this.$el.html(this.template(_.result(this, 'context')));
    },
    context: function() {
      return {
        color: ''
      };
    }
  });
  RightPanel = Backbone.View.extend({
    el: '#right-panel',
    __body_template: "<ul class=\"actions\">\n\n</ul>",
    template: function(c) {
      return Mustache.render(this.__body_template, c);
    },
    events: {
      'click #right-panel-toggle': 'toggle'
    },
    toggle: function() {
      return this.$('#right-panel-body').toggleClass('red').toggle();
    },
    context: function() {
      return this.model.toJSON();
    },
    initialize: function() {
      return console.log('Initializing Right Panel');
    },
    render: function() {
      return this.$('#right-panel-body').html(this.template(_.result(this, 'context')));
    }
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
    },
    bootstrap: function(data) {
      var right_panel;

      log(data);
      if (App.started) {
        return;
      }
      App.World = new World({
        Regions: REGIONS
      });
      return right_panel = new RightPanel({
        model: World
      });
    },
    playTurn: function(data) {}
  };
  return App.init(function(position) {
    var socket;

    if ($("#status").hasClass("success")) {
      return;
    }
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
});
