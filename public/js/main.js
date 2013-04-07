var __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

$(function() {
  var App, BLUE, BUILD_RESEARCH_CENTER, CHARTER_FLIGHT, DIRECT_FLIGHT, DISCARD, DISCOVER_CURE, DISPATCH, DISPATCHER, DRIVE, MAX_NUM_CARDS, MEDIC, OPS_EXPERT, PASS, RED, REGIONS, RESEARCHER, SCIENTIST, SHARE_KNOWLEDGE, SHUTTLE_FLIGHT, TOKEN_COLORS, TOKEN_INDEX, TREAT_DISEASE, createLine, currentTurn, infectionRate2numCards, initLogic, log, numPlayers, playTurn, player2SpecialAction, playerBasicActions, playerRoles, playerSpecialActions;

  window.Game = this;
  App = {
    Model: {},
    View: {},
    Collection: {},
    World: null,
    Socket: null
  };
  window.App = App;
  MAX_NUM_CARDS = 7;
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
  DISCARD = 11;
  OPS_EXPERT = 1;
  RESEARCHER = 2;
  MEDIC = 3;
  SCIENTIST = 4;
  DISPATCHER = 5;
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
      transform: transform,
      '-webkit-transform-origin': '0% 0%'
    }).width(length).offset({
      left: x1,
      top: y1
    });
    return line;
  };
  window._createLine = createLine;
  REGIONS = {
    YELLOW: {
      "Los Angeles": {
        connections: ["Sydney", "San Francisco", "Chicago", "Mexico City"],
        css: {
          top: 310,
          left: 175
        }
      },
      "Mexico City": {
        connections: ["Los Angeles", "Chicago", "Miami", "Bogota", "Lima"],
        css: {
          top: 360,
          left: 240
        }
      },
      Miami: {
        connections: ["Mexico City", "Atlanta", "Washington", "Bogota"],
        css: {
          top: 320,
          left: 320
        }
      },
      Bogota: {
        connections: ["Mexico City", "Miami", "Sao Paulo", "Buenos Aires", "Lima"],
        css: {
          top: 388,
          left: 323
        }
      },
      Lima: {
        connections: ["Mexico City", "Bogota", "Santiago"],
        css: {
          top: 445,
          left: 300
        }
      },
      Santiago: {
        connections: ["Lima"],
        css: {
          top: 510,
          left: 320
        }
      },
      "Buenos Aires": {
        connections: ["Bogota", "Sao Paulo"],
        css: {
          top: 525,
          left: 385
        }
      },
      "Sao Paulo": {
        connections: ["Bogota", "Madrid", "Lagos", "Buenos Aires"],
        css: {
          top: 475,
          left: 430
        }
      },
      Lagos: {
        connections: ["Sao Paulo", "Khartoum", "Kinshasa"],
        css: {
          top: 380,
          left: 560
        }
      },
      Khartoum: {
        connections: ["Lagos", "Cairo", "Johannesburg", "Kinshasa"],
        css: {
          top: 395,
          left: 655
        }
      },
      Kinshasa: {
        connections: ["Lagos", "Khartoum", "Johannesburg"],
        css: {
          top: 445,
          left: 600
        }
      },
      Johannesburg: {
        connections: ["Kinshasa", "Khartoum"],
        css: {
          top: 500,
          left: 635
        }
      }
    },
    BLACK: {
      Moscow: {
        connections: ["Tehran", "Istanbul", "St. Petersburg"],
        css: {
          top: 180,
          left: 710
        }
      },
      Tehran: {
        connections: ["Moscow", "Baghdad", "Karachi", "Delhi"],
        css: {
          top: 240,
          left: 750
        }
      },
      Istanbul: {
        connections: ["St. Petersburg", "Moscow", "Milan", "Baghdad", "Algiers", "Cairo"],
        css: {
          top: 246,
          left: 655
        }
      },
      Delhi: {
        connections: ["Tehran", "Karachi", "Kolkata", "Mumbai", "Chennai"],
        css: {
          top: 290,
          left: 810
        }
      },
      Baghdad: {
        connections: ["Tehran", "Istanbul", "Karachi", "Cairo", "Riyadh"],
        css: {
          top: 290,
          left: 695
        }
      },
      Karachi: {
        connections: ["Tehran", "Delhi", "Baghdad", "Riyadh", "Mumbai"],
        css: {
          top: 310,
          left: 750
        }
      },
      Kolkata: {
        connections: ["Delhi", "Chennai", "Bangkok", "Hong Kong"],
        css: {
          top: 320,
          left: 860
        }
      },
      Algiers: {
        connections: ["Madrid", "Paris", "Istanbul", "Cairo"],
        css: {
          top: 310,
          left: 575
        }
      },
      Cairo: {
        connections: ["Algiers", "Istanbul", "Baghdad", "Riyadh", "Khartoum"],
        css: {
          top: 340,
          left: 630
        }
      },
      Riyadh: {
        connections: ["Cairo", "Baghdad", "Karachi"],
        css: {
          top: 360,
          left: 710
        }
      },
      Mumbai: {
        connections: ["Karachi", "Delhi", "Chennai"],
        css: {
          top: 360,
          left: 780
        }
      },
      Chennai: {
        connections: ["Mumbai", "Delhi", "Kolkata", "Bangkok", "Jakarta"],
        css: {
          top: 400,
          left: 820
        }
      }
    },
    RED: {
      Beijing: {
        connections: ["Shanghai", "Seoul"],
        css: {
          top: 210,
          left: 895
        }
      },
      Seoul: {
        connections: ["Beijing", "Shanghai", "Tokyo"],
        css: {
          top: 220,
          left: 960
        }
      },
      Tokyo: {
        connections: ["Shanghai", "Seoul", "Osaka", "San Francisco"],
        css: {
          top: 240,
          left: 1020
        }
      },
      Shanghai: {
        connections: ["Beijing", "Seoul", "Tokyo", "Taipei", "Hong Kong"],
        css: {
          top: 285,
          left: 900
        }
      },
      Osaka: {
        connections: ["Tokyo", "Taipei"],
        css: {
          top: 290,
          left: 1015
        }
      },
      Taipei: {
        connections: ["Shanghai", "Osaka", "Hong Kong", "Manila"],
        css: {
          top: 320,
          left: 965
        }
      },
      "Hong Kong": {
        connections: ["Kolkata", "Shanghai", "Taipei", "Manila", "Ho Chi Minh City", "Bangkok"],
        css: {
          top: 340,
          left: 910
        }
      },
      Bangkok: {
        connections: ["Kolkata", "Chennai", "Hong Kong", "Ho Chi Minh City", "Jakarta"],
        css: {
          top: 385,
          left: 875
        }
      },
      "Ho Chi Minh City": {
        connections: ["Jakarta", "Bangkok", "Hong Kong", "Manila"],
        css: {
          top: 410,
          left: 930
        }
      },
      Manila: {
        connections: ["Ho Chi Minh City", "Hong Kong", "Taipei", "San Francisco", "Sydney"],
        css: {
          top: 400,
          left: 1000
        }
      },
      Jakarta: {
        connections: ["Chennai", "Bangkok", "Ho Chi Minh City", "Sydney"],
        css: {
          top: 450,
          left: 880
        }
      },
      Sydney: {
        connections: ["Jakarta", "Manila", "Los Angeles"],
        css: {
          top: 530,
          left: 1040
        }
      }
    },
    BLUE: {
      "San Francisco": {
        connections: ["Tokyo", "Manila", "Chicago", "Los Angeles"],
        css: {
          top: 255,
          left: 160
        }
      },
      Chicago: {
        connections: ["San Francisco", "Los Angeles", "Mexico City", "Atlanta", "Toronto"],
        css: {
          top: 210,
          left: 250
        }
      },
      Toronto: {
        connections: ["Chicago", "New York", "Washington"],
        css: {
          top: 200,
          left: 315
        }
      },
      "New York": {
        connections: ["Toronto", "Washington", "London", "Madrid"],
        css: {
          top: 240,
          left: 400
        }
      },
      Washington: {
        connections: ["Atlanta", "Toronto", "New York", "Miami"],
        css: {
          top: 280,
          left: 360
        }
      },
      Atlanta: {
        connections: ["Chicago", "Washington", "Miami"],
        css: {
          top: 270,
          left: 285
        }
      },
      London: {
        connections: ["New York", "Essen", "Madrid", "Paris"],
        css: {
          top: 165,
          left: 510
        }
      },
      Essen: {
        connections: ["London", "Paris", "Milan", "St. Petersburg"],
        css: {
          top: 152,
          left: 573
        }
      },
      "St. Petersburg": {
        connections: ["Essen", "Istanbul", "Moscow"],
        css: {
          top: 140,
          left: 675
        }
      },
      Madrid: {
        connections: ["New York", "London", "Paris", "Sao Paulo", "Algiers"],
        css: {
          top: 280,
          left: 500
        }
      },
      Paris: {
        connections: ["Madrid", "London", "Essen", "Milan", "Algiers"],
        css: {
          top: 213,
          left: 560
        }
      },
      Milan: {
        connections: ["Paris", "Essen", "Istanbul"],
        css: {
          top: 205,
          left: 605
        }
      }
    }
  };
  App.Model.World = Backbone.Model.extend({
    initialize: function(options) {
      var _this = this;

      this.set('curedDiseases', []);
      this.set('eradicatedDiseases', []);
      this.set('infectionRate', 0);
      this.Regions = options.Regions;
      this.Cities = {};
      return _.each(this.Regions, function(Region, Color) {
        return _.each(Region, function(obj, name) {
          var City;

          City = new App.Model.City(obj);
          City.set('id', name);
          City.set('color', Color);
          City.set('name', name);
          return _this.Cities[name] = City;
        });
      });
    },
    initGraph: function() {
      var _this = this;

      this.CityViews = [];
      _.each(this.Cities, function(City) {
        var view;

        City.initConnections();
        view = new App.View.City({
          model: City
        });
        $('#stage').append(view.render().el);
        view.setPosition();
        return _this.CityViews.push(view);
      });
      return _.each(this.CityViews, function(view) {
        return view.drawConnections();
      });
    },
    makeNodesSelectable: function() {
      console.log("World nodes made selectable");
      return _.each(this.CityViews, function(view) {
        return view.makeSelectable();
      });
    },
    makeNodesUnselectable: function() {
      return _.each(this.CityViews, function(view) {
        return view.makeUnselectable();
      });
    },
    makeCardsSelectable: function() {
      App.Hand.show();
      return App.Hand.makeSelectable();
    },
    makeCardsUnselectable: function() {
      App.Hand.hide();
      return App.Hand.makeUnselectable();
    },
    makePlayersSelectable: function() {
      App.PlayersView.show();
      return App.PlayersView.makeSelectable();
    },
    makePlayersUnselectable: function() {
      App.PlayersView.hide();
      return App.PlayersView.makeUnselectable();
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
          App.PlayerDiscard.shift(card);
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
          App.PlayerDiscard.shift(card);
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
        if (this.get('role') === 'ops expert') {
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
    shareKnowledge: function(targetUser, targetCard) {
      var canTransfer, card, curLocation, haveTheCard, myCards, ret, _i, _len;

      ret = 0;
      curLocation = this.get('location');
      haveTheCard = false;
      myCards = this.get('cards');
      for (_i = 0, _len = myCards.length; _i < _len; _i++) {
        card = myCards[_i];
        if (targetCard === card) {
          haveTheCard = true;
        }
      }
      if (!haveTheCard) {
        alert("You do not have that card");
        return -1;
      }
      if (targetUser.get('cards').length >= 7) {
        alert("Target user has too many cards already");
        return -1;
      }
      canTransfer = (targetCard.get('name') === curLocation.get('name')) || this.get('role') === 'researcher';
      if (canTransfer) {
        myCards.remove(targetCard);
        targetUser.get('cards').push(targetCard);
      } else {
        alert("Cant transfer unless you are on the location");
        ret = -1;
      }
      return ret;
    },
    dispatch: function(targetUser, destination) {
      var player, ret, _i, _len, _ref;

      ret = -1;
      if (this.get('role') !== 'dispatcher') {
        alert("Can only dispatch if you are a dispatcher");
        return -1;
      }
      _ref = App.Players;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        player = _ref[_i];
        if (player.get('location') === destination) {
          targetUser.set('location', destination);
          ret = 0;
          break;
        }
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
        ret = this.dispatch(options['targetUser'], options['destination']);
      } else if (actionId === BUILD_RESEARCH_CENTER) {
        ret = this.buildResearchCenter();
      } else if (actionId === DISCOVER_CURE) {
        ret = this.discoverCure(options['color']);
      } else if (actionId === TREAT_DISEASE) {
        ret = this.treatDisease();
      } else if (actionId === SHARE_KNOWLEDGE) {
        ret = this.shareKnowledge(options['targetUser'], options['targetCard']);
      } else {
        ret = -1;
      }
      return ret;
    },
    drawPlayerCards: function() {
      var bottomCard, card, i, infectionDiscard, numCardsToDraw, playerDeck, _i, _j, _len;

      numCardsToDraw = 2;
      playerDeck = App.World.get('playerDeck');
      for (i = _i = 0; _i < 2; i = ++_i) {
        card = playerDeck.shift();
        if (card.get('type') === 'epidemic') {
          Backbone.trigger('epidemic');
          bottomCard = App.World.get('infectionDeck').pop();
          App.World.Cities[bottomCard.get('name')].setDiseaseCubes(3);
          infectionDiscard = App.World.get('infectionDiscard');
          infectionDiscard.push(bottomCard);
          infectionDiscard.shuffle();
          for (_j = 0, _len = infectionDiscard.length; _j < _len; _j++) {
            card = infectionDiscard[_j];
            infectionDiscard.remove(card);
            App.World.get('infectionDeck').unshift(card);
          }
        } else {
          this.get('cards').unshift(card);
          if (this.get('cards').length > MAX_NUM_CARDS) {
            Backbone.trigger('too many cards');
          }
        }
      }
      return {
        drawInfectionCards: function() {
          var infectionDeck, _k, _results;

          numCardsToDraw = infectionRate2numCards[App.World.get('infectionRate')];
          infectionDeck = App.World.get('infectionDeck');
          _results = [];
          for (i = _k = 0; 0 <= numCardsToDraw ? _k < numCardsToDraw : _k > numCardsToDraw; i = 0 <= numCardsToDraw ? ++_k : --_k) {
            card = infectionDeck.shift();
            App.World.Cities[card.get('name')].infect(1);
            _results.push(App.World.get('infectionDiscard').unshift(card));
          }
          return _results;
        }
      };
    }
  });
  TOKEN_COLORS = ['black', 'red', 'yellow', 'blue'];
  TOKEN_INDEX = 0;
  App.View.User = Backbone.View.extend({
    tagName: 'div',
    className: 'user-token',
    initialize: function() {
      var color;

      _.bindAll(this, 'render', 'moveToCoordinates', 'moveToCity');
      color = TOKEN_COLORS[TOKEN_INDEX++];
      return this.$el.addClass(color);
    },
    render: function() {
      return this.$el.html(this.template(' '));
    },
    moveToCoordinates: function(x, y) {
      return this.$el.css({
        top: y + 12,
        left: x + 12
      });
    },
    moveToCity: function(city) {
      var x, y;

      console.log(city);
      x = city.get('css').left;
      y = city.get('css').top;
      return this.moveToCoordinates(x, y);
    }
  });
  App.Model.Card = Backbone.Model.extend();
  App.Collection.Card = Backbone.Collection.extend({
    model: App.Model.Card
  });
  App.View.Card = Backbone.View.extend({
    tagName: "li",
    className: "card",
    __template: "<div class=\"sphere {{color}} pull-left\"></div>\n<div class=\"name\">{{name}}</div>\n<div class=\"map\">&nbsp;</div>\n<div class=\"sphere {{color}} pull-right\"></div>",
    template: function(c) {
      return Mustache.render(this.__template, c);
    },
    initialize: function() {
      return _.bindAll(this, 'selectCard', 'render');
    },
    events: {
      'click': 'selectCard'
    },
    render: function() {
      this.$el.html(this.template(_.result(this, 'context')));
      return this;
    },
    context: function() {
      var json, _ref;

      json = this.model.toJSON();
      json.color = (_ref = App.World.Cities[this.model.get('name')]) != null ? _ref.get('color') : void 0;
      return json;
    },
    selectCard: function() {
      return Backbone.trigger('card:selected', this.model.id);
    },
    makeSelectable: function() {},
    makeUnselectable: function() {}
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
    setDiseaseCubes: function(numCubes) {
      return this.set('diseaseCubes', numCubes);
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
    __template: "<ul class=\"num-infected\">\n  {{#num_infected}}\n  <li class=\"infected-cube {{color}}\">&nbsp;</li>\n  {{/num_infected}}\n</ul>\n<div class=\"sphere {{color}}\"></div>\n<div class=\"research-center {{#researchCenter}}active{{/researchCenter}}\"></div>",
    template: function(c) {
      return Mustache.render(this.__template, c);
    },
    initialize: function() {
      return _.bindAll(this, 'onClick');
    },
    events: {
      'click': 'onClick'
    },
    render: function() {
      this.$el.html(this.template(_.result(this, 'context')));
      return this;
    },
    setPosition: function() {
      return this.$el.css(this.model.get('css'));
    },
    context: function() {
      var i, json, num_infected, _i, _ref;

      json = this.model.toJSON();
      num_infected = [];
      console.log("There are " + (this.model.get('numInfected')) + " infected");
      for (i = _i = 0, _ref = this.model.get('numInfected'); 0 <= _ref ? _i <= _ref : _i >= _ref; i = 0 <= _ref ? ++_i : --_i) {
        num_infected.push({
          color: this.model.get('color')
        });
      }
      json.num_infected = num_infected;
      return json;
    },
    makeSelectable: function() {
      this.selectable = true;
      return this.$el.addClass('selectable');
    },
    makeUnselectable: function() {
      this.selectable = false;
      return this.$el.removeClass('selectable');
    },
    onClick: function() {
      if (!this.selectable) {
        return;
      }
      return Backbone.trigger('city:selected', this.model.id);
    },
    drawConnections: function() {
      var h, w,
        _this = this;

      w = this.$el.width() / 2;
      h = this.$el.height() / 2;
      return _.each(this.model.get('connections'), function(city) {
        var leftMost, length, rightMost, x1, x2, y1, y2;

        if (!city.get('connsAlreadyDrawn')) {
          x1 = _this.model.get('css').left + w;
          y1 = _this.model.get('css').top + h;
          x2 = city.get('css').left + w;
          y2 = city.get('css').top + h;
          length = Math.max(x1 - x2, x2 - x1);
          if (length > $('#stage').width() / 2) {
            console.log(_this.model.id, city.id);
            leftMost = null;
            rightMost = null;
            if (x1 > x2) {
              leftMost = city;
              rightMost = _this.model;
            } else {
              leftMost = _this.model;
              rightMost = city;
            }
            x1 = 0;
            y1 = rightMost.get('css').top + h;
            x2 = leftMost.get('css').left + w;
            y2 = leftMost.get('css').top + h;
            createLine(x1, y1, x2, y2);
            x1 = rightMost.get('css').left + w;
            y1 = rightMost.get('css').top + h;
            x2 = $('#stage').width();
            y2 = leftMost.get('css').top + h;
            createLine(x1, y1, x2, y2);
          } else {
            createLine(x1, y1, x2, y2);
          }
          return _this.model.set('connsAlreadyDrawn', true);
        }
      });
    }
  });
  App.Collection.City = Backbone.Collection.extend({
    model: App.Model.City
  });
  App.View.Player = Backbone.View.extend({
    tagName: 'li',
    className: 'player',
    __template: "<h4 data-id=\"{{id}}\">Name: {{name}}</h4>\n<h4>Role: {{role}}</h4>",
    template: function(c) {
      return Mustache.render(this.__template, c);
    },
    render: function() {
      console.log(this.model.toJSON());
      this.$el.html(this.template(this.model.toJSON()));
      return this;
    },
    makeSelectable: function() {},
    makeUnselectable: function() {}
  });
  App.View.PlayersPanel = Backbone.View.extend({
    el: '#player-panel',
    __template: "<ul class=\"players\"></ul>",
    events: {
      'click .player': 'playerClicked',
      'click .submit': 'submitted'
    },
    template: function(c) {
      return Mustache.render(this.__template, c);
    },
    initialize: function(options) {
      _.bindAll(this, 'playerClicked', 'submitted', 'show', 'hide');
      this.players = options.players;
      return this.subviews = [];
    },
    render: function() {
      var _this = this;

      this.$el.html(this.template({}));
      _.each(this.players, function(player) {
        var view;

        view = (new App.View.Player({
          model: player
        })).render();
        _this.$('.players').append(view.el);
        return _this.subviews.push(view);
      });
      return this;
    },
    playerClicked: function(e) {
      var id;

      id = parseInt($(e.currentTarget).data('id'));
      $(e.currentTarget).toggleClass('active');
      return this.playerSelected = id;
    },
    submitted: function(e) {
      $('.player').removeClass('active');
      Backbone.trigger('player:selected', this.playerSelected);
      return this.playerSelected = null;
    },
    show: function() {
      return this.$el.show();
    },
    hide: function() {
      return this.$el.hide();
    },
    makeSelectable: function() {
      this.selectable = true;
      return _.each(this.subviews, function(view) {
        return view.makeSelectable();
      });
    },
    makeUnselectable: function() {
      this.selectable = false;
      return _.each(this.suviews, function(view) {
        return view.makeUnselectable();
      });
    }
  });
  App.View.Hand = Backbone.View.extend({
    el: '#hand',
    __template: "<ul class=\"cards\"></ul>",
    template: function(c) {
      return Mustache.render(this.__template, c);
    },
    initialize: function() {
      _.bindAll(this, 'render', 'show', 'hide');
      return this.subviews = [];
    },
    render: function() {
      var _this = this;

      this.$el.html(this.template({}));
      this.collection.forEach(function(card) {
        var view;

        view = (new App.View.Card({
          model: card
        })).render();
        _this.$('.cards').append(view.el);
        return _this.subviews.push(view);
      });
      return this;
    },
    show: function() {
      return this.$el.show();
    },
    hide: function() {
      return this.$el.hide();
    },
    makeSelectable: function() {
      this.selectable = true;
      return _.each(this.subviews, function(view) {
        return view.makeSelectable();
      });
    },
    makeUnselectable: function() {
      this.selectable = false;
      return _.each(this.suviews, function(view) {
        return view.makeUnselectable();
      });
    }
  });
  App.View.RightPanel = Backbone.View.extend({
    el: '#right-panel',
    __template: "<ul class=\"actions\">\n  <li class=\"label\"><h4>Movement</h4></li>\n  <li class=\"action first\" data-action=\"1\">Drive</li>\n  <li class=\"action\" data-action=\"2\">Direct Flight</li>\n  <li class=\"action\" data-action=\"3\">Charter Flight</li>\n  <li class=\"action\" data-action=\"4\">Shuttle Flight</li>\n  <li class=\"action\" data-action=\"5\">Pass</li>\n  <li class=\"label\"><h4>Special Actions</h4></li>\n  <li class=\"action first\" data-action=\"6\">Dispatch</li>\n  <li class=\"action\" data-action=\"7\">Build Research Center</li>\n  <li class=\"action\" data-action=\"8\">Discover Cure</li>\n  <li class=\"action\" data-action=\"9\">Treat Disease</li>\n  <li class=\"action\" data-action=\"10\">Share Knowledge</li>\n  <li class=\"action\" data-action=\"11\">Discard</li>\n</ul>",
    template: function(c) {
      return Mustache.render(this.__template, c);
    },
    events: {
      'click .action': 'takeAction'
    },
    context: function() {
      return this.model.toJSON();
    },
    initialize: function() {
      return this.user = App.User;
    },
    render: function() {
      this.$el.html(this.template(_.result(this, 'context')));
      return this;
    },
    takeAction: function(e) {
      var id;

      if ($(e.currentTarget).hasClass('active')) {
        App.ActionListener.actionTaken = false;
        this.$('.action').removeClass('active');
        App.PlayersPanel.hide();
        App.PlayersPanel.makeUnselectable();
        App.Hand.hide();
        App.Hand.makeUnselectable();
        App.World.makeNodesUnselectable();
      } else {
        App.ActionListener.actionTaken = true;
        this.$('.action').removeClass('active');
        $(e.currentTarget).toggleClass('active');
        id = parseInt($(e.currentTarget).data('action'), 10);
        console.log("Taking action " + id);
        return Backbone.trigger('rightPanel:actionTaken', id);
      }
    }
  });
  App.View.InfectionRate = Backbone.View.extend({
    el: '#infection_rate',
    __template: "<h4 style=\"opacity: 0.5; margin-top: 5px;\">Infection Rate</h4>\n<h2>{{num}}</h2>",
    template: function(c) {
      return Mustache.render(this.__template, c);
    },
    initialize: function() {
      _.bindAll(this, 'increaseInfectionRate');
      this.numCards = infectionRate2numCards[App.World.get('infectionRate')];
      return Backbone.on('increase_infection_rate', this.increaseInfectionRate);
    },
    render: function() {
      this.$el.html(this.template({
        num: this.numCards
      }));
      return this;
    },
    increaseInfectionRate: function() {
      var rate;

      rate = App.World.get('infectionRate');
      if (rate < 6) {
        App.World.set('infectionRate', rate + 1);
      }
      this.numCards = infectionRate2numCards[App.World.get('infectionRate')];
      return this.render();
    }
  });
  App.View.Infections = Backbone.View.extend({
    el: '#outbreaks',
    __template: "<h4 style=\"opacity: 0.5; margin-top: 5px;\">Outbreaks</h4>\n<h2>{{num}} out of 8</h2>",
    template: function(c) {
      return Mustache.render(this.__template, c);
    },
    initialize: function() {
      _.bindAll(this, 'increaseOutbreaks');
      this.numOutbreak = 1;
      return Backbone.on('outbreak', this.increaseOutbreaks);
    },
    render: function() {
      this.$el.html(this.template({
        num: this.numOutbreak
      }));
      return this;
    },
    increaseOutbreaks: function() {
      this.numOutbreak++;
      return this.render();
    }
  });
  App.View.Cures = Backbone.View.extend({
    el: '#cures',
    __template: "<ul class=\"cures\">\n  <li class=\"cure sphere RED\"></li>\n  <li class=\"cure sphere YELLOW\"></li>\n  <li class=\"cure sphere BLACK\"></li>\n  <li class=\"cure sphere BLUE\"></li>\n</ul>",
    template: function(c) {
      return Mustache.render(this.__template, c);
    },
    initialize: function() {
      _.bindAll(this, 'cure');
      return Backbone.on('cure', this.cure);
    },
    render: function() {
      this.$el.html(this.template({
        cured: this.cured
      }));
      return this;
    },
    cure: function(color) {
      return this.$(".cure." + (color.toUpperCase())).addClass('cured');
    }
  });
  App.View.ActionListener = Backbone.View.extend({
    BackboneEvents: {
      'rightPanel:actionTaken': 'rightPanelAction',
      'city:selected': 'citySelected',
      'card:selected': 'cardSelected',
      'player:selected': 'playerSelected'
    },
    initialize: function() {
      var _this = this;

      _.bindAll(this);
      _.each(this.BackboneEvents, function(fnname, event) {
        return Backbone.on(event, _this[fnname]);
      });
      return this.dict = {
        destination: null,
        cardId: null,
        traderId: null,
        discardCardId: null
      };
    },
    rightPanelAction: function(id) {
      console.log("Right panel took action " + id);
      if ((DRIVE <= id && id <= SHUTTLE_FLIGHT) || id === BUILD_RESEARCH_CENTER) {
        App.World.makeNodesSelectable();
      }
      if (id === PASS) {
        App.endTurn();
      }
      if (id === SHARE_KNOWLEDGE) {
        App.PlayersPanel.show();
        App.PlayersPanel.makeSelectable();
      }
      if (id === DISCARD) {
        App.Hand.show();
        return App.Hand.makeSelectable();
      }
    },
    citySelected: function(id) {
      alert("Selected city " + id);
      if (App.ActionListener.actionTaken = true) {
        App.takeAction(id, {
          destination: id
        });
        return App.World.makeNodesUnselectable();
      } else {
        return App.World.makeNodesUnselectable();
      }
    },
    cardSelected: function(id) {
      console.log("Selected card " + id);
      if (App.ActionListener.actionTaken = true) {
        App.takeAction(id, {
          cardId: id
        });
        return App.Hand.hide();
      } else {
        return App.World.makeCardsUnselectable();
      }
    },
    playerSelected: function(id) {
      console.log("Selected player " + id);
      this.dict.traderId = id;
      if (App.ActionListener.actionTaken = true) {
        App.takeAction(id, {
          traderId: id
        });
        return App.PlayersPanel.hide();
      } else {
        return App.World.makePlayersUnselectable();
      }
    },
    clearSelections: function(name) {
      return this.dict = {
        destination: null,
        cardId: null,
        traderId: null,
        discardCardId: null
      };
    }
  });
  _.extend(App, {
    init: function(cb) {
      if (navigator.geolocation) {
        navigator.geolocation.watchPosition(cb, this.error);
      } else {
        error("not supported");
      }
      $('#right-panel').toggle();
      $('#right-panel-toggle').click(function(e) {
        return $('#right-panel').toggle();
      });
      $('#hand').toggle();
      $('#hand-toggle').click(function(e) {
        return $('#hand').toggle();
      });
      $('#player-panel').toggle();
      $('#players-toggle').click(function(e) {
        return $('#player-panel').toggle();
      });
      return App.World = new App.Model.World({
        Regions: REGIONS
      });
    },
    error: function(msg) {
      return log(msg);
    },
    bootstrap: function(data) {
      console.log('bootstrapped data =>', data);
      if (App.started) {
        return;
      }
      return initLogic(data);
    },
    playTurn: function(data) {
      return playTurn(data);
    },
    takeAction: function(actionId, options) {
      return App.User.takeAction(actionId, options);
    },
    globalStop: function() {
      return $('body').addClass('paused');
    },
    globalResume: function() {
      return $('body').removeClass('paused');
    },
    playActionCard: function(data) {},
    endTurn: function() {
      App.ActionListener.clearSelections();
      App.Socket.emit('endTurn', {
        playerId: ''
      });
      return App.globalStop();
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
      var player, view, _i, _len, _ref;

      App.bootstrap(data);
      App.World.initGraph();
      App.RightPanel = new App.View.RightPanel({
        model: App.World
      });
      App.RightPanel.render();
      App.PlayersPanel = (new App.View.PlayersPanel({
        players: App.Players
      })).render();
      App.Hand = (new App.View.Hand({
        collection: App.User.get('cards')
      })).render();
      App.InfectionsView = (new App.View.Infections()).render();
      App.InfectionRateView = (new App.View.InfectionRate()).render();
      App.ActionListener = new App.View.ActionListener();
      App.Cures = (new App.View.Cures()).render();
      App.Tokens = [];
      _ref = App.Players;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        player = _ref[_i];
        view = new App.View.User({
          model: player
        });
        $('#stage').append(view.el);
        App.Tokens.push(view);
        view.moveToCity(App.World.Cities['Atlanta']);
      }
      return App.started = true;
    });
    socket.on("message", function(data) {
      App.globalResume();
      return App.playTurn(data);
    });
    return socket.on("globalActionPlayed", function(data) {
      App.globalStop();
      return App.playActionCard(data);
    });
  });
  initLogic = function(data) {
    var appPlayers, cardName, cityName, infectionDeck, name, newCard, numInfections, player, playerCards, playerDeck, playerDict, userId, _i, _j, _k, _l, _len, _len1, _len2, _len3, _ref, _ref1, _ref2, _ref3, _ref4;

    console.log("HERE WE ARE IN INIT LOGIC");
    console.log(data);
    App = window.App;
    App.World.Cities['Atlanta'].buildResearchCenter();
    userId = data['clientId'];
    appPlayers = [];
    _ref = data['players'];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      playerDict = _ref[_i];
      player = new App.Model.User(playerDict);
      playerCards = [];
      _ref1 = player.get('cards');
      for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
        cardName = _ref1[_j];
        playerCards.push(new App.Model.Card({
          id: cardName,
          'name': cardName,
          'type': 'city card'
        }));
      }
      player.set('cards', new App.Collection.Card(playerCards));
      player.set('location', App.World.Cities[player.get('location')]);
      appPlayers.push(player);
      if (playerDict['clientId'] === userId) {
        App.User = player;
      }
    }
    App.Players = appPlayers;
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
    App.World.set('infectionDeck', new App.Collection.Card(infectionDeck));
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
    App.World.set('playerDeck', new App.Collection.Card(playerDeck));
    App.World.set('infectionDiscard', new App.Collection.Card());
    App.World.set('playerDiscard', new App.Collection.Card());
    _ref4 = data['infections'];
    for (cityName in _ref4) {
      numInfections = _ref4[cityName];
      App.World.Cities[cityName].infect(numInfections);
    }
    return console.log("DONE WITH INIT");
  };
  return playTurn = function(data) {
    alert('here in playTurn');
    console.log("@@@");
    console.log(data);
    return App.User.set('actions', 4);
  };
});
