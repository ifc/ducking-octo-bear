$ ->

  # Keep reference to Context
  window.Game = this
  App =
    Model: {}
    View: {}
    Collection: {}
    World: null
    Socket: null
  window.App = App

  #
  # Definitions
  #
  MAX_NUM_CARDS = 7
  log = console.log
  infectionRate2numCards =
    0: 2
    1: 2
    2: 2
    3: 3
    4: 3
    5: 4
    6: 4

  # Game State
  currentTurn = -1 # 1 to numPlayers
  numPlayers = 7 # 1 to 7

  playerRoles =
    Medic:
      description: """
        Removes all cubes of a single color when you treat a city,
        Administer known cures for free
      """
    Researcher:
      description: """
        You may give a player cards from your hand for 1 action per card.
        Both of your pawns must be in the same city, but it doesn't matter which city you are in
      """
    Scientist:
      description: """
        You only need 4 cards of the same color to discover a cure
      """
    Dispatcher:
      description: """
        Move your fellow players' pawns on your turn as if they were your own.
        Move any pawn to another city containing a pawn for 1 action.
      """
    Operations:
      description: """
        You may build a Research Station in your current city for one action.
        Once per turn at a research station you may spend an action and discard any city card to move to any city
      """

  RED     = 1
  BLUE    = 2

  DRIVE                 = 1
  DIRECT_FLIGHT         = 2
  CHARTER_FLIGHT        = 3
  SHUTTLE_FLIGHT        = 4
  PASS                  = 5
  DISPATCH              = 6
  BUILD_RESEARCH_CENTER = 7
  DISCOVER_CURE         = 8
  TREAT_DISEASE         = 9
  SHARE_KNOWLEDGE       = 10
  DISCARD               = 11

  # ROLES
  OPS_EXPERT = 1
  RESEARCHER = 2
  MEDIC = 3
  SCIENTIST = 4
  DISPATCHER = 5

  playerBasicActions = [DRIVE, DIRECT_FLIGHT, CHARTER_FLIGHT, SHUTTLE_FLIGHT, PASS]
  playerSpecialActions = [DISPATCH, BUILD_RESEARCH_CENTER, DISCOVER_CURE, TREAT_DISEASE, SHARE_KNOWLEDGE]
  playerBasicActions =
  player2SpecialAction =
    1: DISPATCH
    2: BUILD_RESEARCH_CENTER
    3: TREAT_DISEASE

  # Usage: $()
  createLine = (x1, y1, x2, y2) ->
    length = Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2))
    angle = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI
    transform = "rotate(" + angle + "deg)"
    line = $("<div>").appendTo("body").addClass("line").css(
      position: "absolute"
      transform: transform
      '-webkit-transform-origin': '0% 0%'
    ).width(length).offset(
      left: x1
      top: y1
    )
    line

  window._createLine = createLine

  # Cities are Backbone objects
  REGIONS =
    YELLOW:
      "Los Angeles":
        connections: ["Sydney", "San Francisco", "Chicago", "Mexico City"]
        css:
          top: 310
          left: 175

      "Mexico City":
        connections: ["Los Angeles", "Chicago", "Miami", "Bogota", "Lima"]
        css:
          top: 360
          left: 240

      Miami:
        connections: ["Mexico City", "Atlanta", "Washington", "Bogota"]
        css:
          top: 320
          left: 320

      Bogota:
        connections: ["Mexico City", "Miami", "Sao Paulo", "Buenos Aires", "Lima"]
        css:
          top: 388
          left: 323

      Lima:
        connections: ["Mexico City", "Bogota", "Santiago"]
        css:
          top: 445
          left: 300

      Santiago:
        connections: ["Lima"]
        css:
          top: 510
          left: 320

      "Buenos Aires":
        connections: ["Bogota", "Sao Paulo"]
        css:
          top: 525
          left: 385

      "Sao Paulo":
        connections: ["Bogota", "Madrid", "Lagos", "Buenos Aires"]
        css:
          top: 475
          left: 430

      Lagos:
        connections: ["Sao Paulo", "Khartoum", "Kinshasa"]
        css:
          top: 380
          left: 560

      Khartoum:
        connections: ["Lagos", "Cairo", "Johannesburg", "Kinshasa"]
        css:
          top: 395
          left: 655

      Kinshasa:
        connections: ["Lagos", "Khartoum", "Johannesburg"]
        css:
          top: 445
          left: 600

      Johannesburg:
        connections: ["Kinshasa", "Khartoum"]
        css:
          top: 500
          left: 635

    BLACK:
      Moscow:
        connections: ["Tehran", "Istanbul", "St. Petersburg"]
        css:
          top: 180
          left: 710

      Tehran:
        connections: ["Moscow", "Baghdad", "Karachi", "Delhi"]
        css:
          top: 240
          left: 750

      Istanbul:
        connections: ["St. Petersburg", "Moscow", "Milan", "Baghdad", "Algiers", "Cairo"]
        css:
          top: 246
          left: 655

      Delhi:
        connections: ["Tehran", "Karachi", "Kolkata", "Mumbai", "Chennai"]
        css:
          top: 290
          left: 810

      Baghdad:
        connections: ["Tehran", "Istanbul", "Karachi", "Cairo", "Riyadh"]
        css:
          top: 290
          left: 695

      Karachi:
        connections: ["Tehran", "Delhi", "Baghdad", "Riyadh", "Mumbai"]
        css:
          top: 310
          left: 750

      Kolkata:
        connections: ["Delhi", "Chennai", "Bangkok", "Hong Kong"]
        css:
          top: 320
          left: 860

      Algiers:
        connections: ["Madrid", "Paris", "Istanbul", "Cairo"]
        css:
          top: 310
          left: 575

      Cairo:
        connections: ["Algiers", "Istanbul", "Baghdad", "Riyadh", "Khartoum"]
        css:
          top: 340
          left: 630

      Riyadh:
        connections: ["Cairo", "Baghdad", "Karachi"]
        css:
          top: 360
          left: 710

      Mumbai:
        connections: ["Karachi", "Delhi", "Chennai"]
        css:
          top: 360
          left: 780

      Chennai:
        connections: ["Mumbai", "Delhi", "Kolkata", "Bangkok", "Jakarta"]
        css:
          top: 400
          left: 820

    RED:
      Beijing:
        connections: ["Shanghai", "Seoul"]
        css:
          top: 210
          left: 895

      Seoul:
        connections: ["Beijing", "Shanghai", "Tokyo"]
        css:
          top: 220
          left: 960

      Tokyo:
        connections: ["Shanghai", "Seoul", "Osaka", "San Francisco"]
        css:
          top: 240
          left: 1020

      Shanghai:
        connections: ["Beijing", "Seoul", "Tokyo", "Taipei", "Hong Kong"]
        css:
          top: 285
          left: 900

      Osaka:
        connections: ["Tokyo", "Taipei"]
        css:
          top: 290
          left: 1015

      Taipei:
        connections: ["Shanghai", "Osaka", "Hong Kong", "Manila"]
        css:
          top: 320
          left: 965

      "Hong Kong":
        connections: ["Kolkata", "Shanghai", "Taipei", "Manila", "Ho Chi Minh City", "Bangkok"]
        css:
          top: 340
          left: 910

      Bangkok:
        connections: ["Kolkata", "Chennai", "Hong Kong", "Ho Chi Minh City", "Jakarta"]
        css:
          top: 385
          left: 875

      "Ho Chi Minh City":
        connections: ["Jakarta", "Bangkok", "Hong Kong", "Manila"]
        css:
          top: 410
          left: 930

      Manila:
        connections: ["Ho Chi Minh City", "Hong Kong", "Taipei", "San Francisco", "Sydney"]
        css:
          top: 400
          left: 1000

      Jakarta:
        connections: ["Chennai", "Bangkok", "Ho Chi Minh City", "Sydney"]
        css:
          top: 450
          left: 880

      Sydney:
        connections: ["Jakarta", "Manila", "Los Angeles"]
        css:
          top: 530
          left: 1040

    BLUE:
      "San Francisco":
        connections: ["Tokyo", "Manila", "Chicago", "Los Angeles"]
        css:
          top: 255
          left: 160

      Chicago:
        connections: ["San Francisco", "Los Angeles", "Mexico City", "Atlanta", "Toronto"]
        css:
          top: 210
          left: 250

      Toronto:
        connections: ["Chicago", "New York", "Washington"]
        css:
          top: 200
          left: 315

      "New York":
        connections: ["Toronto", "Washington", "London", "Madrid"]
        css:
          top: 240
          left: 400

      Washington:
        connections: ["Atlanta", "Toronto", "New York", "Miami"]
        css:
          top: 280
          left: 360

      Atlanta:
        connections: ["Chicago", "Washington", "Miami"]
        css:
          top: 270
          left: 285

      London:
        connections: ["New York", "Essen", "Madrid", "Paris"]
        css:
          top: 165
          left: 510

      Essen:
        connections: ["London", "Paris", "Milan", "St. Petersburg"]
        css:
          top: 152
          left: 573

      "St. Petersburg":
        connections: ["Essen", "Istanbul", "Moscow"]
        css:
          top: 140
          left: 675

      Madrid:
        connections: ["New York", "London", "Paris", "Sao Paulo", "Algiers"]
        css:
          top: 280
          left: 500

      Paris:
        connections: ["Madrid", "London", "Essen", "Milan", "Algiers"]
        css:
          top: 213
          left: 560

      Milan:
        connections: ["Paris", "Essen", "Istanbul"]
        css:
          top: 205
          left: 605

  App.Model.World = Backbone.Model.extend
    initialize: (options) ->
      # Setting a bunch of state variables here. Easier to toJSON().
      @set('curedDiseases', [])
      @set('eradicatedDiseases', [])
      @set('infectionRate', 0)

      @Regions = options.Regions
      @Cities = {}
      _.each @Regions, (Region, Color) =>
        _.each Region, (obj, name) =>
          City = new App.Model.City(obj)
          City.set 'id', name
          City.set 'color', Color
          City.set 'name', name
          @Cities[name] = City

    # Link to cities for each
    initGraph: ->
      @CityViews = []
      _.each @Cities, (City) =>
        City.initConnections()
        view = new App.View.City {model: City}
        $('#stage').append(view.render().el)
        view.setPosition()
        @CityViews.push(view)
        # draw lines
      _.each @CityViews, (view) =>
        view.drawConnections()
    makeNodesSelectable: ->
      console.log "World nodes made selectable"
      _.each @CityViews, (view) ->
        view.makeSelectable()
    makeNodesUnselectable: ->
      _.each @CityViews, (view) ->
        view.makeUnselectable()
    makeCardsSelectable: ->
      App.Hand.show()
      App.Hand.makeSelectable()
    makeCardsUnselectable: ->
      App.Hand.hide()
      App.Hand.makeUnselectable()
    makePlayersSelectable: ->
      App.PlayersView.show()
      App.PlayersView.makeSelectable()
    makePlayersUnselectable: ->
      App.PlayersView.hide()
      App.PlayersView.makeUnselectable()

  App.Model.User = Backbone.Model.extend
    drive: (destination) ->
      ret = 0
      curLocation = @get('location')
      if destination in curLocation.get('connections')
        @set('location', destination)
      else
        alert("Driving to an unconnected city?")
        ret = -1
      return ret

    directFlight: (destination) ->
      ret = -1
      myCards = @get('cards')
      for card in myCards
        if card.get('name') == destination.get('name')
          myCards.remove(card)
          App.PlayerDiscard.shift(card)
          @set('location', destination)
          ret = 0
          break

      if ret == -1
        alert("Trying to direct flight to a place you don't have a card to?")

      return ret

    charterFlight: (destination) ->
      ret = -1
      curLocation = @get('location')

      myCards = @get('cards')
      for card in myCards
        if card.get('name') == curLocation.get('name')
          myCards.remove(card)
          App.PlayerDiscard.shift(card)
          @set('location', destination)
          ret = 0
          break

      if ret == -1
        alert("Trying to charter flight when you don't have your current locations card?")

      return ret

    shuttleFlight: (destination) ->
      ret = 0
      curLocation = @get('location')

      if curLocation.hasResearchCenter() and destination.hasResearchCenter()
        @set('location', destination)
      else
        ret = -1
        alert("Can't shuttle flight between places without research centers")

      return ret

    # Researcher role complete.
    buildResearchCenter: ->
      ret = 0
      curLocation = @get('location')

      if not curLocation.hasResearchCenter()
        if @get('role') == 'ops expert'
          curLocation.buildResearchCenter()
        else
          builtRc = false
          myCards = @get('cards')
          for card in myCards
            if card.get('name') == curLocation.get('name')
              builtRc = true
              curLocation.buildResearchCenter()
              break
          if not builtRc
            alert("Can't build research center unless you have the card where you are located")
      else
        alert("Building research center at place that already has one?")
        ret = -1

      return ret

    # TODO: if eradicated -> then all.
    # Medic cole complete.
    treatDisease: ->
      ret = 0
      curLocation = @get('location')

      if curLocation.get('diseaseCubes') > 0
        if @get('role') == 'medic'
          curLocation.treat(3)
        else
          curLocation.treat(1)
      else
        alert("Treating a city with no disease?")
        ret = -1

      return ret

    # TODO: given 'selected' cards.
    # Scientist role complete.
    discoverCure: (targetColor) ->
      ret = -1
      curLocation = @get('location')
      targetColor = targetColor.toUpperCase()
      numCardsOfColor = 0

      # Make sure we are on at a research center.
      if not curLocation.hasResearchCenter()
        alert("Current location must have a research center to discover a cure!")
        return -1

      if color in App.World.get('curedDiseases')
        alert("Already discovered a cure for this color!")
        return -1

      # Count the number of cards there are of this color.
      myCards = @get('cards')
      for card in myCards
        if card.get('color') == targetColor
          numCardsOfColor = numCardsOfColor + 1

      minNumCards = if @get('role') == 'scientist' then 4 else 5
      if numCardsOfColor >= minNumCards
        cardsToRemove = minNumCards

        # Remove cards.
        for card in myCards
          if card.get('color') == targetColor and cardsToRemove >= 0
            myCards.remove(card)
            cardsToRemove = cardsToRemove - 1

        # Cure the disease
        App.World.get('curedDiseases').push(color)

        ret = 0

      return ret

    shareKnowledge: (targetUser, targetCard) ->
      ret = 0
      curLocation = @get('location')

      # Make sure I have the card.
      haveTheCard = false
      myCards = @get('cards')
      for card in myCards
        if targetCard == card
          haveTheCard = true

      if not haveTheCard
        alert("You do not have that card")
        return -1

      # Make sure the other user has room.
      if targetUser.get('cards').length >= 7
        alert("Target user has too many cards already")
        return -1

      # Transfer the card.
      canTransfer = (targetCard.get('name') == curLocation.get('name')) or @get('role') == 'researcher'
      if canTransfer
        myCards.remove(targetCard)
        targetUser.get('cards').push(targetCard)
      else
        alert("Cant transfer unless you are on the location")
        ret = -1

      return ret

    dispatch: (targetUser, destination) ->
      ret = -1
      if @get('role') != 'dispatcher'
        alert("Can only dispatch if you are a dispatcher")
        return -1

      # TODO Try these first:
      #drive: (destination) ->
      #directFlight: (destination) ->
      #charterFlight: (destination) ->
      #shuttleFlight

      # Finally see if the location is where someone else is.
      for player in App.Players
        if player.get('location') == destination
          targetUser.set('location', destination)
          ret = 0
          break

      return ret

    # Will return 0 if action was performed. If not zero, couldn't take action.
    # - TODO: bake in player roles.
    takeAction: (actionId, options) ->
      ret = 0

      if actionId == DRIVE
        ret = @drive(options['destination'])
      else if actionId == DIRECT_FLIGHT
        ret = @directFlight(options['destination'])
      else if actionId == CHARTER_FLIGHT
        ret = @charterFlight(options['destination'])
      else if actionId == SHUTTLE_FLIGHT
        ret = @shuttleFlight(options['destination'])
      else if actionId == PASS
        ret = 0
      else if actionId == DISPATCH
        ret = @dispatch(options['targetUser'], options['destination'])
      else if actionId == BUILD_RESEARCH_CENTER
        ret = @buildResearchCenter()
      else if actionId == DISCOVER_CURE
        ret = @discoverCure(options['color'])
      else if actionId == TREAT_DISEASE
        ret = @treatDisease()
      else if actionId == SHARE_KNOWLEDGE
        ret = @shareKnowledge(options['targetUser'], options['targetCard'])
      else
        ret = -1

      return ret

    # Draw the two player cards after a players turn.
    # - will trigger a global epidemic event if epidemic is triggered.
    drawPlayerCards: () ->
      numCardsToDraw = 2
      playerDeck = App.World.get('playerDeck')

      for i in [0...2]
        card = playerDeck.shift()

        if card.get('type') == 'epidemic'
          Backbone.trigger('epidemic')

          # Draw the bottom card from the infection cards.
          bottomCard = App.World.get('infectionDeck').pop()

          # Infect that city.
          App.World.Cities[bottomCard.get('name')].setDiseaseCubes(3)

          # Shuffle cards and place back on infection blah.
          infectionDiscard = App.World.get('infectionDiscard')
          infectionDiscard.push(bottomCard)
          infectionDiscard.shuffle()
          for card in infectionDiscard
            infectionDiscard.remove(card)
            App.World.get('infectionDeck').unshift(card)

        else
          @get('cards').unshift(card)
          if @get('cards').length > MAX_NUM_CARDS
            Backbone.trigger('too many cards')


      drawInfectionCards: () ->
        numCardsToDraw = infectionRate2numCards[App.World.get('infectionRate')]
        infectionDeck = App.World.get('infectionDeck')

        for i in [0...numCardsToDraw]
          card = infectionDeck.shift()
          App.World.Cities[card.get('name')].infect(1)
          App.World.get('infectionDiscard').unshift(card)


  TOKEN_COLORS = ['black', 'red', 'yellow', 'blue']
  TOKEN_INDEX = 0
  App.View.User = Backbone.View.extend
    tagName: 'div'
    className: 'user-token'
    initialize: ->
      _.bindAll this, 'render', 'moveToCoordinates', 'moveToCity'
      color = TOKEN_COLORS[TOKEN_INDEX++]
      @$el.addClass(color)
    render: ->
      @$el.html(@template ' ')
    moveToCoordinates: (x, y)->
      @$el.css({top: y + 12, left: x + 12})
    moveToCity: (city) ->
      console.log city
      x = city.get('css').left
      y = city.get('css').top
      @moveToCoordinates(x, y)

  App.Model.Card = Backbone.Model.extend()

  App.Collection.Card = Backbone.Collection.extend
    model: App.Model.Card

  App.View.Card = Backbone.View.extend
    tagName: "li"
    className: "card"
    __template: """
      <div class="sphere {{color}} pull-left"></div>
      <div class="name">{{name}}</div>
      <div class="map">&nbsp;</div>
      <div class="sphere {{color}} pull-right"></div>
    """
    template: (c) -> Mustache.render @__template, c
    initialize: ->
      _.bindAll this, 'selectCard', 'render'
    events:
      'click': 'selectCard'
    render: ->
      @$el.html(@template _.result this, 'context')
      return this
    context: ->
      json = @model.toJSON()
      json.color = App.World.Cities[@model.get 'name']?.get('color')
      json
    # Because players may select multiple cards to trade...
    selectCard: ->
      Backbone.trigger 'card:selected', @model.id
    makeSelectable: ->
    makeUnselectable: ->

  App.Model.City = Backbone.Model.extend
    initialize: (opt) ->
      @connections = opt.connections
      @set "researchCenter", 0
      @set "diseaseCubes", 0

    initConnections: ->
      connections = _.map @get("connections"), (name) ->
        App.World.Cities[name]
      @set "connections", connections
      delete this['connections']

    buildResearchCenter: ->
      @set("researchCenter", 1)

    hasResearchCenter: ->
      return (@get('researchCenter') == 1)

    treat: (numCubes) ->
      @addDiseaseCubes(-1 * numCubes)
      if @get("diseaseCubes") < 0
        @set("diseaseCubes", 0)

    setDiseaseCubes: (numCubes) ->
      @set('diseaseCubes', numCubes)

    infect: (numCubes) ->
      @addDiseaseCubes(numCubes)
      if @get("diseaseCubes") > 3
        @set("diseaseCubes", 3)
        _.each @get("connections"), ->
          connections.infect(1)

    addDiseaseCubes: (num) ->
      @set "diseaseCubes", @get("diseaseCubes") + num

  App.View.City = Backbone.View.extend
    tagName: "div"
    className: "cityview"
    __template: """
      <ul class="num-infected">
        {{#num_infected}}
        <li class="infected-cube {{color}}">&nbsp;</li>
        {{/num_infected}}
      </ul>
      <div class="sphere {{color}}"></div>
      <div class="research-center active"></div>
    """
    template: (c) -> Mustache.render @__template, c
    initialize: ->
      _.bindAll this, 'onClick'
    events:
      'click': 'onClick'
    render: ->
      @$el.html @template _.result this, 'context'
      return this
    setPosition: ->
      @$el.css @model.get('css')
    context: ->
      json = @model.toJSON()
      num_infected = []
      console.log "There are #{@model.get('numInfected')} infected"
      for i in [0..@model.get('numInfected')]
        num_infected.push({color: @model.get('color')})
      json.num_infected = num_infected
      json
    makeSelectable: ->
      @selectable = true
      @$el.addClass('selectable')
    makeUnselectable: ->
      @selectable = false
      @$el.removeClass('selectable')
    onClick: ->
      return if not @selectable
      Backbone.trigger 'city:selected', @model.id
    drawConnections: ->
      w = @$el.width() / 2
      h = @$el.height() / 2
      _.each @model.get('connections'), (city) =>
        if not city.get('connsAlreadyDrawn')
          x1 = @model.get('css').left + w
          y1 = @model.get('css').top + h
          x2 = city.get('css').left + w
          y2 = city.get('css').top + h
          length = Math.max(x1-x2, x2-x1)
          if length > $('#stage').width() / 2
            console.log @model.id, city.id
            # draw two lines as we 'wrap around' the board
            leftMost = null
            rightMost = null
            if x1 > x2
              leftMost = city
              rightMost = @model
            else
              leftMost = @model
              rightMost = city
            # draw line from left edge
            x1 = 0
            y1 = rightMost.get('css').top + h
            x2 = leftMost.get('css').left + w
            y2 = leftMost.get('css').top + h
            createLine(x1, y1, x2, y2)
            # draw line to right edge
            x1 = rightMost.get('css').left + w
            y1 = rightMost.get('css').top + h
            x2 = $('#stage').width()
            y2 = leftMost.get('css').top + h
            createLine(x1, y1, x2, y2)
          else
            createLine(x1, y1, x2, y2)
          @model.set 'connsAlreadyDrawn', true

  App.Collection.City = Backbone.Collection.extend
    model: App.Model.City

  App.View.Player = Backbone.View.extend
    tagName: 'li'
    className: 'player'
    __template: """
      <h4 data-id="{{id}}">Name: {{name}}</h4>
      <h4>Role: {{role}}</h4>
    """
    template: (c) -> Mustache.render @__template, c
    render: ->
      console.log @model.toJSON()
      @$el.html(@template @model.toJSON())
      return this
    makeSelectable: ->
    makeUnselectable: ->

  App.View.PlayersPanel = Backbone.View.extend
    el: '#player-panel'
    __template: """
      <ul class="players"></ul>
    """
    events:
      'click .player': 'playerClicked'
      'click .submit': 'submitted'
    template: (c) -> Mustache.render @__template, c
    initialize: (options )->
      _.bindAll this, 'playerClicked', 'submitted', 'show', 'hide'
      @players = options.players
      @subviews = []
    render: ->
      @$el.html @template({})
      _.each @players, (player) =>
        view = (new App.View.Player {model: player}).render()
        @$('.players').append(view.el)
        @subviews.push(view)
      return this
    playerClicked: (e) ->
      id = parseInt $(e.currentTarget).data('id')
      $(e.currentTarget).toggleClass('active')
      @playerSelected = id
    submitted: (e) ->
      $('.player').removeClass('active')
      Backbone.trigger 'player:selected', @playerSelected
      @playerSelected = null
    show: -> @$el.show()
    hide: -> @$el.hide()
    makeSelectable: ->
      @selectable = true
      _.each @subviews, (view) -> view.makeSelectable()
    makeUnselectable: ->
      @selectable = false
      _.each @suviews, (view) -> view.makeUnselectable()

  App.View.Hand = Backbone.View.extend
    el: '#hand'
    __template: """
      <ul class="cards"></ul>
    """
    template: (c) -> Mustache.render @__template, c
    initialize: ->
      _.bindAll this, 'render', 'show', 'hide'
      @subviews = []
    render: ->
      @$el.html @template({})
      @collection.forEach (card) =>
        view = (new App.View.Card({model: card})).render()
        @$('.cards').append(view.el)
        @subviews.push(view)
      return this
    show: -> @$el.show()
    hide: -> @$el.hide()
    makeSelectable: ->
      @selectable = true
      _.each @subviews, (view) -> view.makeSelectable()
    makeUnselectable: ->
      @selectable = false
      _.each @suviews, (view) -> view.makeUnselectable()

  App.View.RightPanel = Backbone.View.extend
    el: '#right-panel'
    __template: """
      <ul class="actions">
        <li class="label"><h4>Movement</h4></li>
        <li class="action first" data-action="1">Drive</li>
        <li class="action" data-action="2">Direct Flight</li>
        <li class="action" data-action="3">Charter Flight</li>
        <li class="action" data-action="4">Shuttle Flight</li>
        <li class="action" data-action="5">Pass</li>
        <li class="label"><h4>Special Actions</h4></li>
        <li class="action first" data-action="6">Dispatch</li>
        <li class="action" data-action="7">Build Research Center</li>
        <li class="action" data-action="8">Discover Cure</li>
        <li class="action" data-action="9">Treat Disease</li>
        <li class="action" data-action="10">Share Knowledge</li>
        <li class="action" data-action="11">Discard</li>
      </ul>
    """
    template: (c) -> Mustache.render @__template, c
    events:
      'click .action': 'takeAction'
    context: -> @model.toJSON()
    initialize: ->
      @user = App.User
    render: ->
      @$el.html @template _.result this, 'context'
      return this
    takeAction: (e) ->
      if $(e.currentTarget).hasClass('active')
        App.ActionListener.actionTaken = false
        @$('.action').removeClass('active')
        App.PlayersPanel.hide()
        App.PlayersPanel.makeUnselectable()
        App.Hand.hide()
        App.Hand.makeUnselectable()
        App.World.makeNodesUnselectable()
        return
      else
        App.ActionListener.actionTaken = true
        @$('.action').removeClass('active')
        $(e.currentTarget).toggleClass('active')
        id = parseInt $(e.currentTarget).data('action'), 10
        console.log "Taking action #{id}"
        Backbone.trigger 'rightPanel:actionTaken', id

  # Backbone.trigger 'increase_infection_rate'
  App.View.InfectionRate = Backbone.View.extend
    el: '#infection_rate'
    __template: """
      <h4 style="opacity: 0.5; margin-top: 5px;">Infection Rate</h4>
      <h2>{{num}}</h2>
    """
    template: (c) -> Mustache.render @__template, c
    initialize: ->
      _.bindAll this, 'increaseInfectionRate'
      @numCards = infectionRate2numCards[App.World.get('infectionRate')]
      Backbone.on 'increase_infection_rate', @increaseInfectionRate
    render: ->
      @$el.html @template({num: @numCards})
      return this
    increaseInfectionRate: ->
      rate = App.World.get('infectionRate')
      if rate < 6 then App.World.set('infectionRate', rate + 1)
      @numCards = infectionRate2numCards[App.World.get('infectionRate')]
      @render()

  # Backbone.trigger 'outbreak'
  App.View.Infections = Backbone.View.extend
    el: '#outbreaks'
    __template: """
      <h4 style="opacity: 0.5; margin-top: 5px;">Outbreaks</h4>
      <h2>{{num}} out of 8</h2>
    """
    template: (c) -> Mustache.render @__template, c
    initialize: ->
      _.bindAll this, 'increaseOutbreaks'
      @numOutbreak = 1
      Backbone.on 'outbreak', @increaseOutbreaks
    render: ->
      @$el.html @template({num: @numOutbreak})
      return this
    increaseOutbreaks: ->
      @numOutbreak++
      @render()

  # Backbone.trigger 'cure', 'YELLOW'
  App.View.Cures = Backbone.View.extend
    el: '#cures'
    __template: """
      <ul class="cures">
        <li class="cure sphere RED"></li>
        <li class="cure sphere YELLOW"></li>
        <li class="cure sphere BLACK"></li>
        <li class="cure sphere BLUE"></li>
      </ul>
    """
    template: (c) -> Mustache.render @__template, c
    initialize: ->
      _.bindAll this, 'cure'
      Backbone.on 'cure', @cure
    render: ->
      @$el.html @template({cured: @cured})
      return this
    cure: (color) ->
      @$(".cure.#{color.toUpperCase()}").addClass 'cured'

  App.View.ActionListener = Backbone.View.extend
    BackboneEvents:
      'rightPanel:actionTaken': 'rightPanelAction'
      'city:selected': 'citySelected'
      'card:selected': 'cardSelected'
      'player:selected': 'playerSelected'
    initialize: ->
      _.bindAll(this)
      _.each @BackboneEvents, (fnname, event) =>
        Backbone.on event, @[fnname]
      @dict =
        destination: null
        cardId: null
        traderId: null
        discardCardId: null

    rightPanelAction: (id) ->
      console.log "Right panel took action #{id}"
      if DRIVE <= id <= SHUTTLE_FLIGHT or id == BUILD_RESEARCH_CENTER
        App.World.makeNodesSelectable()

      if id == PASS
        App.endTurn()

      if id == SHARE_KNOWLEDGE
        App.PlayersPanel.show()
        App.PlayersPanel.makeSelectable()

      if id == DISCARD
        App.Hand.show()
        App.Hand.makeSelectable()

    citySelected: (id) ->
      alert "Selected city #{id}"
      if App.ActionListener.actionTaken = true
        App.takeAction(id, {destination: id})
        App.World.makeNodesUnselectable()
      else
        App.World.makeNodesUnselectable()
    cardSelected: (id) ->
      console.log "Selected card #{id}"
      if App.ActionListener.actionTaken = true
        App.takeAction(id, {cardId: id})
        App.Hand.hide()
      else
        App.World.makeCardsUnselectable()
    playerSelected: (id) ->
      console.log "Selected player #{id}"
      @dict.traderId = id
      if App.ActionListener.actionTaken = true
        App.takeAction(id, {traderId: id})
        App.PlayersPanel.hide()
      else
        App.World.makePlayersUnselectable()

    clearSelections: (name) ->
      @dict =
        destination: null
        cardId: null
        traderId: null
        discardCardId: null

  #
  # Async bootstrap. App is only global object
  #
  # App.Socket
  # App.World
  _.extend App,

    ###############################

    init: (cb) ->

      # Geo locate
      if navigator.geolocation

        # navigator.geolocation.getCurrentPosition(cb, this.error);
        navigator.geolocation.watchPosition cb, @error
      else
        error "not supported"

      $('#right-panel').toggle()
      $('#right-panel-toggle').click (e) ->
        # $(e.currentTarget).toggleClass('red')
        $('#right-panel').toggle()

      $('#hand').toggle()
      $('#hand-toggle').click (e) ->
        # $(e.currentTarget).toggleClass('red')
        $('#hand').toggle()

      $('#player-panel').toggle()
      $('#players-toggle').click (e) ->
        $('#player-panel').toggle()

      # World creates a basic graph from
      # cities and updates.
      App.World = new App.Model.World
        Regions: REGIONS

    ###############################

    error: (msg) ->
      log msg

    ###############################

    bootstrap: (data) ->
      console.log('bootstrapped data =>', data)
      return if App.started
      initLogic(data)

    playTurn: (data) ->
      playTurn(data)

    takeAction: (actionId, options) ->
      return App.User.takeAction(actionId, options)

    ################################

    globalStop: ->
      $('body').addClass('paused')

    ################################

    globalResume: ->
      $('body').removeClass('paused')

    ################################

    playActionCard: (data) ->

    ################################

    endTurn: ->
      App.ActionListener.clearSelections()
      App.Socket.emit 'endTurn', {playerId: ''}
      App.globalStop()

  ###############
  # Initialize
  ###############

  App.init (position) ->

    # Start logic

    # not sure why we're hitting this twice in FF,
    # I think it's to do with a cached result coming back
    return if App.succeeded
    App.succeeded = true
    # x = position.coords.latitude
    # y = position.coords.longitude
    socket = io.connect("http://localhost:3000")
    App.Socket = socket

    socket.on "bootstrap", (data) ->
      App.bootstrap(data)

      App.World.initGraph()
      # App.World.initPlayerViews()
      # App.World.initCardViews()
      App.RightPanel = new App.View.RightPanel {model: App.World}
      App.RightPanel.render()
      App.PlayersPanel = (new App.View.PlayersPanel {players: App.Players}).render()
      App.Hand = (new App.View.Hand {collection: App.User.get('cards')}).render()
      App.InfectionsView = (new App.View.Infections()).render()
      App.InfectionRateView = (new App.View.InfectionRate()).render()
      App.ActionListener = new App.View.ActionListener()
      App.Cures = (new App.View.Cures()).render()

      ## TODO: This ideally is a map of id : view
      App.Tokens = []
      for player in App.Players
        view = (new App.View.User({model: player}))
        $('#stage').append(view.el)
        App.Tokens.push(view)
        view.moveToCity(App.World.Cities['Atlanta'])

      App.started = true

    socket.on "message", (data) ->
      App.globalResume()
      App.playTurn(data)

    socket.on "globalActionPlayed", (data) ->
      App.globalStop()
      App.playActionCard(data)

  initLogic = (data) ->
    # Create the deck, etc.
    console.log("HERE WE ARE IN INIT LOGIC")
    console.log(data)
    App = window.App

    # Define the user.
    userId = data['clientId']
    appPlayers = []
    for playerDict in data['players']
      player = new App.Model.User(playerDict)

      # Assign the cards
      playerCards = []
      for cardName in player.get('cards')
        playerCards.push new App.Model.Card
          id: cardName
          'name': cardName
          'type': 'city card'
      player.set('cards', new App.Collection.Card(playerCards))

      # Set the location
      player.set('location', App.World.Cities[player.get('location')])

      appPlayers.push(player)

      if playerDict['clientId'] == userId
        App.User = player
    App.Players = appPlayers

    # Create infection card deck.
    infectionDeck = []
    for name in data['infectionDeck']
      newCard = new App.Model.Card
        'name': name
        'type': 'infection'
      infectionDeck.push(newCard)
    App.World.set('infectionDeck', new App.Collection.Card(infectionDeck))

    # Create player card deck.
    playerDeck = []
    for name in data['playerDeck']
      newCard = new App.Model.Card
        'name': name
        'type':  if name.indexOf('EPIDEMIC') >= 0 then "epidemic" else "city card"
      playerDeck.push(newCard)
    App.World.set('playerDeck', new App.Collection.Card(playerDeck))

    # Finally initialize the discard piles ()
    App.World.set('infectionDiscard', new App.Collection.Card())
    App.World.set('playerDiscard', new App.Collection.Card())

    # Infect the initial cities.
    for cityName, numInfections of data['infections']
      #console.log(cityName + " " + numInfections)
      App.World.Cities[cityName].infect(numInfections)

    console.log("DONE WITH INIT")


  playTurn = (data) ->

    alert('here in playTurn')
    console.log("@@@")
    console.log(data)

    # Has four actions to start
    App.User.set('actions', 4)


