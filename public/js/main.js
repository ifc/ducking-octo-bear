$(function() {
  var App, BLUE, BUILD_RESEARCH_CENTER, CHARTER_FLIGHT, DIRECT_FLIGHT, DISCOVER_CURE, DISPATCH, DRIVE, PASS, RED, REGIONS, SHARE_KNOWLEDGE, SHUTTLE_FLIGHT, TREAT_DISEASE, createLine, curedDiseases, currentTurn, infection, infectionRate, infectionRate2numCards, initLogic, locationId2Cube, log, numOutbreaks, numPlayers, playTurn, player2SpecialAction, playerBasicActions, playerLocations, playerRoles, playerSpecialActions, researchCenter;

  window.Game = this;
  App = {
    Model: {},
    View: {},
    Collection: {},
    World: null,
    Socket: null
  };
  window.App = App;
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
  RED = 1;
  BLUE = 2;
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
  curedDiseases = [];
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
        connections: ["Sydney", "San Francisco", "Chicago", "Mexico City"],
        css: {
          top: 30,
          left: 40
        }
      },
      "Mexico City": {
        connections: ["Los Angeles", "Chicago", "Miami", "Bogota", "Lima"],
        css: {
          top: 50,
          left: 60
        }
      },
      Miami: {
        connections: ["Mexico City", "Atlanta", "Washington", "Bogota"],
        css: {
          top: 30,
          left: 40
        }
      },
      Bogota: {
        connections: ["Mexico City", "Miami", "Sao Paulo", "Buenos Aires", "Lima"],
        css: {
          top: 30,
          left: 40
        }
      },
      Lima: {
        connections: ["Mexico City", "Bogota", "Santiago"],
        css: {
          top: 30,
          left: 40
        }
      },
      Santiago: {
        connections: ["Lima"],
        css: {
          top: 30,
          left: 40
        }
      },
      "Buenos Aires": {
        connections: ["Bogota", "Sao Paulo"],
        css: {
          top: 30,
          left: 40
        }
      },
      "Sao Paulo": {
        connections: ["Bogota", "Madrid", "Lagos", "Buenos Aires"],
        css: {
          top: 30,
          left: 40
        }
      },
      Lagos: {
        connections: ["Sao Paulo", "Khartoum", "Kinshasa"],
        css: {
          top: 30,
          left: 40
        }
      },
      Khartoum: {
        connections: ["Lagos", "Cairo", "Johannesburg", "Kinshasa"],
        css: {
          top: 30,
          left: 40
        }
      },
      Kinshasa: {
        connections: ["Lagos", "Khartoum", "Johannesburg"],
        css: {
          top: 30,
          left: 40
        }
      },
      Johannesburg: {
        connections: ["Kinshasa", "Khartoum"],
        css: {
          top: 30,
          left: 40
        }
      }
    },
    BLACK: {
      Moscow: {
        connections: ["Tehran", "Istanbul", "St. Petersburg"],
        css: {
          top: 30,
          left: 40
        }
      },
      Tehran: {
        connections: ["Moscow", "Baghdad", "Karachi", "Delhi"],
        css: {
          top: 30,
          left: 40
        }
      },
      Istanbul: {
        connections: ["St. Petersburg", "Moscow", "Milan", "Baghdad", "Algiers", "Cairo"],
        css: {
          top: 30,
          left: 40
        }
      },
      Delhi: {
        connections: ["Tehran", "Karachi", "Kolkata", "Mumbai", "Chennai"],
        css: {
          top: 30,
          left: 40
        }
      },
      Baghdad: {
        connections: ["Tehran", "Istanbul", "Karachi", "Cairo", "Riyadh"],
        css: {
          top: 30,
          left: 40
        }
      },
      Karachi: {
        connections: ["Tehran", "Delhi", "Baghdad", "Riyadh", "Mumbai"],
        css: {
          top: 30,
          left: 40
        }
      },
      Kolkata: {
        connections: ["Delhi", "Chennai", "Bangkok", "Hong Kong"],
        css: {
          top: 30,
          left: 40
        }
      },
      Algiers: {
        connections: ["Madrid", "Paris", "Istanbul", "Cairo"],
        css: {
          top: 30,
          left: 40
        }
      },
      Cairo: {
        connections: ["Algiers", "Istanbul", "Baghdad", "Riyadh", "Khartoum"],
        css: {
          top: 30,
          left: 40
        }
      },
      Riyadh: {
        connections: ["Cairo", "Baghdad", "Karachi"],
        css: {
          top: 30,
          left: 40
        }
      },
      Mumbai: {
        connections: ["Karachi", "Delhi", "Chennai"],
        css: {
          top: 30,
          left: 40
        }
      },
      Chennai: {
        connections: ["Mumbai", "Delhi", "Kolkata", "Bangkok", "Jakarta"],
        css: {
          top: 30,
          left: 40
        }
      }
    },
    RED: {
      Beijing: {
        connections: ["Shanghai", "Seoul"],
        css: {
          top: 30,
          left: 40
        }
      },
      Seoul: {
        connections: ["Beijing", "Shanghai", "Tokyo"],
        css: {
          top: 30,
          left: 40
        }
      },
      Tokyo: {
        connections: ["Shanghai", "Seoul", "Osaka", "San Francisco"],
        css: {
          top: 30,
          left: 40
        }
      },
      Shanghai: {
        connections: ["Beijing", "Seoul", "Tokyo", "Taipei", "Hong Kong"],
        css: {
          top: 30,
          left: 40
        }
      },
      Osaka: {
        connections: ["Tokyo", "Taipei"],
        css: {
          top: 30,
          left: 40
        }
      },
      Taipei: {
        connections: ["Shanghai", "Osaka", "Hong Kong", "Manila"],
        css: {
          top: 30,
          left: 40
        }
      },
      "Hong Kong": {
        connections: ["Kolkata", "Shanghai", "Taipei", "Manila", "Ho Chi Minh City", "Bangkok"],
        css: {
          top: 30,
          left: 40
        }
      },
      Bangkok: {
        connections: ["Kolkata", "Chennai", "Hong Kong", "Ho Chi Minh City", "Jakarta"],
        css: {
          top: 30,
          left: 40
        }
      },
      "Ho Chi Minh City": {
        connections: ["Jakarta", "Bangkok", "Hong Kong", "Manila"],
        css: {
          top: 30,
          left: 40
        }
      },
      Manila: {
        connections: ["Ho Chi Minh City", "Hong Kong", "Taipei", "San Francisco", "Sydney"],
        css: {
          top: 30,
          left: 40
        }
      },
      Jakarta: {
        connections: ["Chennai", "Bangkok", "Ho Chi Minh City", "Sydney"],
        css: {
          top: 30,
          left: 40
        }
      },
      Sydney: {
        connections: ["Jakarta", "Manila", "Los Angeles"],
        css: {
          top: 30,
          left: 40
        }
      }
    },
    BLUE: {
      "San Francisco": {
        connections: ["Tokyo", "Manila", "Chicago", "Los Angeles"],
        css: {
          top: 30,
          left: 40
        }
      },
      Chicago: {
        connections: ["San Francisco", "Los Angeles", "Mexico City", "Atlanta", "Toronto"],
        css: {
          top: 30,
          left: 40
        }
      },
      Toronto: {
        connections: ["Chicago", "New York", "Washington"],
        css: {
          top: 30,
          left: 40
        }
      },
      "New York": {
        connections: ["Toronto", "Washington", "London", "Madrid"],
        css: {
          top: 30,
          left: 40
        }
      },
      Washington: {
        connections: ["Atlanta", "Toronto", "New York", "Miami"],
        css: {
          top: 30,
          left: 40
        }
      },
      Atlanta: {
        connections: ["Chicago", "Washington", "Miami"],
        css: {
          top: 30,
          left: 40
        }
      },
      London: {
        connections: ["New York", "Essen", "Madrid", "Paris"],
        css: {
          top: 30,
          left: 40
        }
      },
      Essen: {
        connections: ["London", "Paris", "Milan", "St. Petersburg"],
        css: {
          top: 30,
          left: 40
        }
      },
      "St. Petersburg": {
        connections: ["Essen", "Istanbul", "Moscow"],
        css: {
          top: 30,
          left: 40
        }
      },
      Madrid: {
        connections: ["New York", "London", "Paris", "Sao Paulo", "Algiers"],
        css: {
          top: 30,
          left: 40
        }
      },
      Paris: {
        connections: ["Madrid", "London", "Essen", "Milan", "Algiers"],
        css: {
          top: 30,
          left: 40
        }
      },
      Milan: {
        connections: ["Paris", "Essen", "Istanbul"],
        css: {
          top: 30,
          left: 40
        }
      }
    }
  };
  App.Model.World = Backbone.Model.extend({
    initialize: function(options) {
      var _this = this;

      this.Regions = options.Regions;
      this.Cities = {};
      return _.each(this.Regions, function(Region, Color) {
        return _.each(Region, function(obj, name) {
          var City;

          City = new App.Model.City(obj);
          City.set('color', Color);
          City.set('name', name);
          return _this.Cities[name] = City;
        });
      });
    },
    initGraph: function() {
      var _this = this;

      this.CityViews = [];
      return _.each(this.Cities, function(City) {
        var view;

        City.initConnections();
        view = new App.View.City({
          model: City
        });
        $('#stage').append(view.render().el);
        view.setPosition();
        return _this.CityViews.push(view);
      });
    }
  });
  App.Model.Card = Backbone.Model.extend();
  App.View.Card = Backbone.Model.extend({
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
  App.Model.City = Backbone.Model.extend({
    initialize: function(opt) {
      this.connections = opt.connections;
      this.set("researchCenter", 0);
      return this.set("diseaseCubes", 0);
    },
    initConnections: function() {
      var connections;

      connections = _.map(this.get("connections"), function(name) {
        return App.World.Cities[name];
      });
      this.set("connections", connections);
      return delete this['connections'];
    },
    infect: function(numCubes) {
      this.addDiseaseCubes(numCubes);
      if (this.get("diseaseCubes") > 3) {
        this.set("diseaseCubes", 3);
        return _.each(this.get("connections"), function() {
          return connections.infect(1);
        });
      }
    },
    addDiseaseCubes: function(num) {
      return this.set("diseaseCubes", this.get("diseaseCubes") + num);
    }
  });
  App.View.City = Backbone.View.extend({
    tagName: "div",
    className: "cityview",
    __template: "<div class=\"sphere {{color}}\"></div>",
    template: function(c) {
      return Mustache.render(this.__template, c);
    },
    render: function() {
      this.$el.html(this.template(_.result(this, 'context')));
      return this;
    },
    setPosition: function() {
      return this.$el.css(this.model.get('css'));
    },
    context: function() {
      return this.model.toJSON();
    }
  });
  App.Collection.City = Backbone.Collection.extend({
    model: App.Model.City
  });
  App.View.RightPanel = Backbone.View.extend({
    el: '#right-panel',
    __template: "<ul class=\"actions\">\n  <li class=\"label\"><h4>Movement</h4></li>\n  <li class=\"action first\" data-action=\"DRIVE\">Drive</li>\n  <li class=\"action\" data-action=\"DIRECT_FLIGHT\">Direct Flight</li>\n  <li class=\"action\" data-action=\"CHARTER_FLIGHT\">Charter Flight</li>\n  <li class=\"action\" data-action=\"SHUTTLE_FLIGHT\">Shuttle Flight</li>\n  <li class=\"action\" data-action=\"PASS\">Pass</li>\n  <li class=\"label\"><h4>Special Actions</h4></li>\n  <li class=\"action first\" data-action=\"DISPATCH\">Dispatch</li>\n  <li class=\"action\" data-action=\"BUILD_RESEARCH_CENTER\">Build Research Center</li>\n  <li class=\"action\" data-action=\"DISCOVER_CURE\">Discover Cure</li>\n  <li class=\"action\" data-action=\"TREAT_DISEASE\">Treat Disease</li>\n  <li class=\"action\" data-action=\"SHARE_KNOWLEDGE\">Share Knowledge</li>\n</ul>",
    template: function(c) {
      return Mustache.render(this.__template, c);
    },
    context: function() {
      return this.model.toJSON();
    },
    render: function() {
      return this.$el.html(this.template(_.result(this, 'context')));
    }
  });
  _.extend(App, {
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
      App.World = new App.Model.World({
        Regions: REGIONS
      });
      App.World.initGraph();
      App.RightPanel = new App.View.RightPanel({
        model: App.World
      });
      return App.RightPanel.render();
    },
    error: function(msg) {
      return log(msg);
    },
    bootstrap: function(data) {
      console.log(data);
      console.log('here');
      if (App.started) {
        return;
      }
      return initLogic(data);
    },
    playTurn: function(data) {
      return playTurn(data);
    }
  });
  App.init(function(position) {
    var socket;

    if (App.succeeded) {
      return;
    }
    App.succeeded = true;
    socket = io.connect("http://localhost:3000");
    App.Socket = socket;
    socket.on("bootstrap", function(data) {
      App.bootstrap(data);
      return App.started = true;
    });
    return socket.on("message", function(data) {
      return App.playTurn(data);
    });
  });
  initLogic = function(data) {
    var cityName, infectionDeck, name, newCard, numInfections, playerDeck, _i, _j, _len, _len1, _ref, _ref1, _ref2;

    console.log("HERE WE ARE IN INIT LOGIC");
    console.log(data);
    App = window.App;
    infectionDeck = [];
    _ref = data['infectionDeck'];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      name = _ref[_i];
      newCard = new App.Model.Card({
        'name': name,
        'type': 'infection'
      });
      infectionDeck.push(newCard);
    }
    App.infectionDeck = infectionDeck;
    playerDeck = [];
    _ref1 = data['playerDeck'];
    for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
      name = _ref1[_j];
      newCard = new App.Model.Card({
        'name': name,
        'type': name.indexOf('EPIDEMIC') >= 0 ? "epidemic" : "city card"
      });
      playerDeck.push(newCard);
    }
    App.playerDeck = playerDeck;
    App.infectionDiscard = [];
    App.playerDiscard = [];
    _ref2 = data['infections'];
    for (cityName in _ref2) {
      numInfections = _ref2[cityName];
      App.World.Cities[cityName].infect(numInfections);
    }
    console.log("DONE WITH INIT");
    return console.log(App);
  };
  return playTurn = function(data) {};
});
