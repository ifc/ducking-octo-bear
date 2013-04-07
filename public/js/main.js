var __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

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
  DISPATCH = 6;
  BUILD_RESEARCH_CENTER = 7;
  DISCOVER_CURE = 8;
  TREAT_DISEASE = 9;
  SHARE_KNOWLEDGE = 10;
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
  playerBasicActions = player2SpecialAction = {
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
          top: 280,
          left: 155
        }
      },
      "Mexico City": {
        connections: ["Los Angeles", "Chicago", "Miami", "Bogota", "Lima"],
        css: {
          top: 305,
          left: 205
        }
      },
      Miami: {
        connections: ["Mexico City", "Atlanta", "Washington", "Bogota"],
        css: {
          top: 268,
          left: 270
        }
      },
      Bogota: {
        connections: ["Mexico City", "Miami", "Sao Paulo", "Buenos Aires", "Lima"],
        css: {
          top: 320,
          left: 275
        }
      },
      Lima: {
        connections: ["Mexico City", "Bogota", "Santiago"],
        css: {
          top: 380,
          left: 260
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
          top: 455,
          left: 330
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
          top: 222,
          left: 135
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

      this.set('curedDiseases', []);
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
    },
    makeNodesSelectable: function() {
      return _.each(this.CityViews, function(view) {
        return view.makeSelectable();
      });
    },
    makeUnselectable: function() {
      return _.each(this.CityViews, function(view) {
        return view.makeUnselectable();
      });
    }
  });
  App.Model.User = Backbone.Model.extend({
    drive: function(destination) {
      var curLocation, ret;

      ret = 0;
      curLocation = this.get('location');
      if (__indexOf.call(curLocation.get('connections'), destination) >= 0) {
        this.set('location', destination);
      } else {
        alert("Driving to an unconnected city?");
        ret = -1;
      }
      return ret;
    },
    directFlight: function(destination) {
      var card, myCards, ret, _i, _len;

      ret = -1;
      myCards = this.get('cards');
      for (_i = 0, _len = myCards.length; _i < _len; _i++) {
        card = myCards[_i];
        if (card.get('name') === destination.get('name')) {
          myCards.remove(card);
          App.playerDiscard.shift(card);
          this.set('location', destination);
          ret = 0;
          break;
        }
      }
      if (ret === -1) {
        alert("Trying to direct flight to a place you don't have a card to?");
      }
      return ret;
    },
    charterFlight: function(destination) {
      var card, curLocation, myCards, ret, _i, _len;

      ret = -1;
      curLocation = this.get('location');
      myCards = this.get('cards');
      for (_i = 0, _len = myCards.length; _i < _len; _i++) {
        card = myCards[_i];
        if (card.get('name') === curLocation.get('name')) {
          myCards.remove(card);
          App.playerDiscard.shift(card);
          this.set('location', destination);
          ret = 0;
          break;
        }
      }
      if (ret === -1) {
        alert("Trying to charter flight when you don't have your current locations card?");
      }
      return ret;
    },
    shuttleFlight: function(destination) {
      var curLocation, ret;

      ret = 0;
      curLocation = this.get('location');
      if (curLocation.hasResearchCenter() && destination.hasResearchCenter()) {
        this.set('location', destination);
      } else {
        ret = -1;
        alert("Can't shuttle flight between places without research centers");
      }
      return ret;
    },
    buildResearchCenter: function() {
      var builtRc, card, curLocation, myCards, ret, _i, _len;

      ret = 0;
      curLocation = this.get('location');
      if (!curLocation.hasResearchCenter()) {
        if (this.get('role') === 'researcher') {
          curLocation.buildResearchCenter();
        } else {
          builtRc = false;
          myCards = this.get('cards');
          for (_i = 0, _len = myCards.length; _i < _len; _i++) {
            card = myCards[_i];
            if (card.get('name') === curLocation.get('name')) {
              builtRc = true;
              curLocation.buildResearchCenter();
              break;
            }
          }
          if (!builtRc) {
            alert("Can't build research center unless you have the card where you are located");
          }
        }
      } else {
        alert("Building research center at place that already has one?");
        ret = -1;
      }
      return ret;
    },
    treatDisease: function() {
      var curLocation, ret;

      ret = 0;
      curLocation = this.get('location');
      if (curLocation.get('diseaseCubes') > 0) {
        if (this.get('role') === 'medic') {
          curLocation.treat(3);
        } else {
          curLocation.treat(1);
        }
      } else {
        alert("Treating a city with no disease?");
        ret = -1;
      }
      return ret;
    },
    discoverCure: function(targetColor) {
      var card, cardsToRemove, curLocation, minNumCards, myCards, numCardsOfColor, ret, _i, _j, _len, _len1;

      ret = -1;
      curLocation = this.get('location');
      targetColor = targetColor.toUpperCase();
      numCardsOfColor = 0;
      if (!curLocation.hasResearchCenter()) {
        alert("Current location must have a research center to discover a cure!");
        return -1;
      }
      if (__indexOf.call(App.World.get('curedDiseases'), color) >= 0) {
        alert("Already discovered a cure for this color!");
        return -1;
      }
      myCards = this.get('cards');
      for (_i = 0, _len = myCards.length; _i < _len; _i++) {
        card = myCards[_i];
        if (card.get('color') === targetColor) {
          numCardsOfColor = numCardsOfColor + 1;
        }
      }
      minNumCards = this.get('role') === 'scientist' ? 4 : 5;
      if (numCardsOfColor >= minNumCards) {
        cardsToRemove = minNumCards;
        for (_j = 0, _len1 = myCards.length; _j < _len1; _j++) {
          card = myCards[_j];
          if (card.get('color') === targetColor && cardsToRemove >= 0) {
            myCards.remove(card);
            cardsToRemove = cardsToRemove - 1;
          }
        }
        App.World.get('curedDiseases').push(color);
        ret = 0;
      }
      return ret;
    },
    takeAction: function(actionId, options) {
      var ret;

      ret = 0;
      if (actionId === DRIVE) {
        ret = this.drive(options['destination']);
      } else if (actionId === DIRECT_FLIGHT) {
        ret = this.directFlight(options['destination']);
      } else if (actionId === CHARTER_FLIGHT) {
        ret = this.charterFlight(options['destination']);
      } else if (actionId === SHUTTLE_FLIGHT) {
        ret = this.shuttleFlight(options['destination']);
      } else if (actionId === PASS) {
        ret = 0;
      } else if (actionId === DISPATCH) {

      } else if (actionId === BUILD_RESEARCH_CENTER) {
        ret = this.buildResearchCenter();
      } else if (actionId === DISCOVER_CURE) {
        ret = this.discoverCure(options['color']);
      } else if (actionId === TREAT_DISEASE) {
        ret = this.treatDisease();
      } else if (actionId === SHARE_KNOWLEDGE) {

      } else {
        ret = -1;
      }
      return ret;
    }
  });
  App.Model.Card = Backbone.Model.extend();
  App.Collection.Card = Backbone.Collection.extend({
    model: App.Model.Card
  });
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
    buildResearchCenter: function() {
      return this.set("researchCenter", 1);
    },
    hasResearchCenter: function() {
      return this.get('researchCenter') === 1;
    },
    treat: function(numCubes) {
      this.addDiseaseCubes(-1 * numCubes);
      if (this.get("diseaseCubes") < 0) {
        return this.set("diseaseCubes", 0);
      }
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
    },
    makeSelectable: function() {
      this.selectable = true;
      return this.$el.addClass('selectable');
    },
    makeUnselectable: function() {
      this.selectable = false;
      return this.$el.removeClass('selectable');
    }
  });
  App.Collection.City = Backbone.Collection.extend({
    model: App.Model.City
  });
  App.View.RightPanel = Backbone.View.extend({
    el: '#right-panel',
    __template: "<ul class=\"actions\">\n  <li class=\"label\"><h4>Movement</h4></li>\n  <li class=\"action first\" data-action=\"1\">Drive</li>\n  <li class=\"action\" data-action=\"2\">Direct Flight</li>\n  <li class=\"action\" data-action=\"3\">Charter Flight</li>\n  <li class=\"action\" data-action=\"4\">Shuttle Flight</li>\n  <li class=\"action\" data-action=\"5\">Pass</li>\n  <li class=\"label\"><h4>Special Actions</h4></li>\n  <li class=\"action first\" data-action=\"6\">Dispatch</li>\n  <li class=\"action\" data-action=\"7\">Build Research Center</li>\n  <li class=\"action\" data-action=\"8\">Discover Cure</li>\n  <li class=\"action\" data-action=\"9\">Treat Disease</li>\n  <li class=\"action\" data-action=\"10\">Share Knowledge</li>\n</ul>",
    template: function(c) {
      return Mustache.render(this.__template, c);
    },
    events: {
      'click .action': 'takeAction'
    },
    context: function() {
      return this.model.toJSON();
    },
    render: function() {
      return this.$el.html(this.template(_.result(this, 'context')));
    },
    takeAction: function(e) {
      var id;

      id = parseInt($(e.currentTarget).data('action'), 10);
      return Backbone.trigger('rightPanel:actionTaken', id);
    }
  });
  App.View.ActionListener = Backbone.View.extend({
    initialize: function() {
      _.bindAll(this);
      return Backbone.on('rightPanel:actionTaken', this.rightPanelAction);
    },
    rightPanelAction: function(id) {
      if ((DRIVE <= id && id <= SHUTTLE_FLIGHT)) {
        return App.World.makeNodesSelectable();
      }
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
      App.RightPanel.render();
      return App.ActionListener = new App.View.ActionListener();
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
    },
    takeAction: function(actionId, options) {
      return window.App.user.takeAction(actionId, options);
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
    var cardName, cityName, infectionDeck, name, newCard, numInfections, playerCards, playerDeck, playerDict, userId, _i, _j, _k, _l, _len, _len1, _len2, _len3, _ref, _ref1, _ref2, _ref3, _ref4;

    console.log("HERE WE ARE IN INIT LOGIC");
    console.log(data);
    App = window.App;
    userId = data['clientId'];
    _ref = data['players'];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      playerDict = _ref[_i];
      if (playerDict['clientId'] === userId) {
        App.user = new App.Model.User(playerDict);
        break;
      }
    }
    playerCards = [];
    _ref1 = App.user.get('cards');
    for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
      cardName = _ref1[_j];
      playerCards.push(new App.Model.Card({
        'name': cardName,
        'type': 'city card'
      }));
    }
    App.user.set('cards', new App.Collection.Card(playerCards));
    App.user.set('location', App.World.Cities[App.user.get('location')]);
    infectionDeck = [];
    _ref2 = data['infectionDeck'];
    for (_k = 0, _len2 = _ref2.length; _k < _len2; _k++) {
      name = _ref2[_k];
      newCard = new App.Model.Card({
        'name': name,
        'type': 'infection'
      });
      infectionDeck.push(newCard);
    }
    App.infectionDeck = new App.Collection.Card(infectionDeck);
    playerDeck = [];
    _ref3 = data['playerDeck'];
    for (_l = 0, _len3 = _ref3.length; _l < _len3; _l++) {
      name = _ref3[_l];
      newCard = new App.Model.Card({
        'name': name,
        'type': name.indexOf('EPIDEMIC') >= 0 ? "epidemic" : "city card"
      });
      playerDeck.push(newCard);
    }
    App.playerDeck = new App.Collection.Card(playerDeck);
    App.infectionDiscard = new App.Collection.Card();
    App.playerDiscard = new App.Collection.Card();
    _ref4 = data['infections'];
    for (cityName in _ref4) {
      numInfections = _ref4[cityName];
      App.World.Cities[cityName].infect(numInfections);
    }
    console.log("DONE WITH INIT");
    return console.log(App);
  };
  return playTurn = function(data) {};
});
