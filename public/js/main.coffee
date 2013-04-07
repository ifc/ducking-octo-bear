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
  numOutbreaks = 0
  infectionRate = 0
  playerLocations = [4, 59, 3, 4]
  locationId2Cube =
    1: 0
    2: 3

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

  curedDiseases = []
  infection = #?????????????????????????????
    location: 1
    disease: RED

  researchCenter = #?????????????????????
    location: 1
    disease: BLUE

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
    ).width(length).offset(
      left: x1
      top: y1
    )
    line

  # Cities are Backbone objects
  REGIONS =
    YELLOW:
      "Los Angeles":
        connections: ["Sydney", "San Francisco", "Chicago", "Mexico City"]
        css:
          top: 280
          left: 155

      "Mexico City":
        connections: ["Los Angeles", "Chicago", "Miami", "Bogota", "Lima"]
        css:
          top: 305
          left: 205

      Miami:
        connections: ["Mexico City", "Atlanta", "Washington", "Bogota"]
        css:
          top: 268
          left: 270

      Bogota:
        connections: ["Mexico City", "Miami", "Sao Paulo", "Buenos Aires", "Lima"]
        css:
          top: 320
          left: 275

      Lima:
        connections: ["Mexico City", "Bogota", "Santiago"]
        css:
          top: 380
          left: 260

      Santiago:
        connections: ["Lima"]
        css:
          top: 30
          left: 40

      "Buenos Aires":
        connections: ["Bogota", "Sao Paulo"]
        css:
          top: 455
          left: 330

      "Sao Paulo":
        connections: ["Bogota", "Madrid", "Lagos", "Buenos Aires"]
        css:
          top: 30
          left: 40

      Lagos:
        connections: ["Sao Paulo", "Khartoum", "Kinshasa"]
        css:
          top: 30
          left: 40

      Khartoum:
        connections: ["Lagos", "Cairo", "Johannesburg", "Kinshasa"]
        css:
          top: 30
          left: 40

      Kinshasa:
        connections: ["Lagos", "Khartoum", "Johannesburg"]
        css:
          top: 30
          left: 40

      Johannesburg:
        connections: ["Kinshasa", "Khartoum"]
        css:
          top: 30
          left: 40

    BLACK:
      Moscow:
        connections: ["Tehran", "Istanbul", "St. Petersburg"]
        css:
          top: 30
          left: 40

      Tehran:
        connections: ["Moscow", "Baghdad", "Karachi", "Delhi"]
        css:
          top: 30
          left: 40

      Istanbul:
        connections: ["St. Petersburg", "Moscow", "Milan", "Baghdad", "Algiers", "Cairo"]
        css:
          top: 30
          left: 40

      Delhi:
        connections: ["Tehran", "Karachi", "Kolkata", "Mumbai", "Chennai"]
        css:
          top: 30
          left: 40

      Baghdad:
        connections: ["Tehran", "Istanbul", "Karachi", "Cairo", "Riyadh"]
        css:
          top: 30
          left: 40

      Karachi:
        connections: ["Tehran", "Delhi", "Baghdad", "Riyadh", "Mumbai"]
        css:
          top: 30
          left: 40

      Kolkata:
        connections: ["Delhi", "Chennai", "Bangkok", "Hong Kong"]
        css:
          top: 30
          left: 40

      Algiers:
        connections: ["Madrid", "Paris", "Istanbul", "Cairo"]
        css:
          top: 30
          left: 40

      Cairo:
        connections: ["Algiers", "Istanbul", "Baghdad", "Riyadh", "Khartoum"]
        css:
          top: 30
          left: 40

      Riyadh:
        connections: ["Cairo", "Baghdad", "Karachi"]
        css:
          top: 30
          left: 40

      Mumbai:
        connections: ["Karachi", "Delhi", "Chennai"]
        css:
          top: 30
          left: 40

      Chennai:
        connections: ["Mumbai", "Delhi", "Kolkata", "Bangkok", "Jakarta"]
        css:
          top: 30
          left: 40

    RED:
      Beijing:
        connections: ["Shanghai", "Seoul"]
        css:
          top: 30
          left: 40

      Seoul:
        connections: ["Beijing", "Shanghai", "Tokyo"]
        css:
          top: 30
          left: 40

      Tokyo:
        connections: ["Shanghai", "Seoul", "Osaka", "San Francisco"]
        css:
          top: 30
          left: 40

      Shanghai:
        connections: ["Beijing", "Seoul", "Tokyo", "Taipei", "Hong Kong"]
        css:
          top: 30
          left: 40

      Osaka:
        connections: ["Tokyo", "Taipei"]
        css:
          top: 30
          left: 40

      Taipei:
        connections: ["Shanghai", "Osaka", "Hong Kong", "Manila"]
        css:
          top: 30
          left: 40

      "Hong Kong":
        connections: ["Kolkata", "Shanghai", "Taipei", "Manila", "Ho Chi Minh City", "Bangkok"]
        css:
          top: 30
          left: 40

      Bangkok:
        connections: ["Kolkata", "Chennai", "Hong Kong", "Ho Chi Minh City", "Jakarta"]
        css:
          top: 30
          left: 40

      "Ho Chi Minh City":
        connections: ["Jakarta", "Bangkok", "Hong Kong", "Manila"]
        css:
          top: 30
          left: 40

      Manila:
        connections: ["Ho Chi Minh City", "Hong Kong", "Taipei", "San Francisco", "Sydney"]
        css:
          top: 30
          left: 40

      Jakarta:
        connections: ["Chennai", "Bangkok", "Ho Chi Minh City", "Sydney"]
        css:
          top: 30
          left: 40

      Sydney:
        connections: ["Jakarta", "Manila", "Los Angeles"]
        css:
          top: 30
          left: 40

    BLUE:
      "San Francisco":
        connections: ["Tokyo", "Manila", "Chicago", "Los Angeles"]
        css:
          top: 222
          left: 135

      Chicago:
        connections: ["San Francisco", "Los Angeles", "Mexico City", "Atlanta", "Toronto"]
        css:
          top: 30
          left: 40

      Toronto:
        connections: ["Chicago", "New York", "Washington"]
        css:
          top: 30
          left: 40

      "New York":
        connections: ["Toronto", "Washington", "London", "Madrid"]
        css:
          top: 30
          left: 40

      Washington:
        connections: ["Atlanta", "Toronto", "New York", "Miami"]
        css:
          top: 30
          left: 40

      Atlanta:
        connections: ["Chicago", "Washington", "Miami"]
        css:
          top: 30
          left: 40

      London:
        connections: ["New York", "Essen", "Madrid", "Paris"]
        css:
          top: 30
          left: 40

      Essen:
        connections: ["London", "Paris", "Milan", "St. Petersburg"]
        css:
          top: 30
          left: 40

      "St. Petersburg":
        connections: ["Essen", "Istanbul", "Moscow"]
        css:
          top: 30
          left: 40

      Madrid:
        connections: ["New York", "London", "Paris", "Sao Paulo", "Algiers"]
        css:
          top: 30
          left: 40

      Paris:
        connections: ["Madrid", "London", "Essen", "Milan", "Algiers"]
        css:
          top: 30
          left: 40

      Milan:
        connections: ["Paris", "Essen", "Istanbul"]
        css:
          top: 30
          left: 40

  App.Model.World = Backbone.Model.extend
    initialize: (options) ->
      @set('curedDiseases', [])
      @Regions = options.Regions
      @Cities = {}
      _.each @Regions, (Region, Color) =>
        _.each Region, (obj, name) =>
          City = new App.Model.City(obj)
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
    makeNodesSelectable: ->
      _.each @CityViews, (view) ->
        view.makeSelectable()
    makeUnselectable: ->
      _.each @CityViews, (view) ->
        view.makeUnselectable()

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
          App.playerDiscard.shift(card)
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
          App.playerDiscard.shift(card)
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
      for player in App.players
        if player.get('location') == destination
          targetUser.set('location', destination)
          ret = 0
          break

      return ret



    # Will return 0 if action was performed. If not zero, couldn't take action. @@@
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


  App.Model.Card = Backbone.Model.extend()

  App.Collection.Card = Backbone.Collection.extend
    model: App.Model.Card

  App.View.Card = Backbone.Model.extend
    tagName: "div"
    className: "card"
    __template: """
      <div class="title">
        <div class="sphere {{color}} pull-left"></div>
      </div>
      <div class="name">
        {{name}}
      </div>
      <div class="map">
        &nbsp;
      </div>
      <div class="footer">
        <div class="sphere {{color}} pull-right"></div>
      </div>
    """
    template: (c) -> Mustache.render @__template, c
    render: ->
      @$el.html @template _.result this, 'context'
    context: ->
      name: ''
      color: ''

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
      <div class="sphere {{color}}"></div>
    """
    template: (c) -> Mustache.render @__template, c
    render: ->
      @$el.html @template _.result this, 'context'
      return this
    setPosition: ->
      @$el.css @model.get('css')
    context: ->
      @model.toJSON()
    makeSelectable: ->
      @selectable = true
      @$el.addClass('selectable')
    makeUnselectable: ->
      @selectable = false
      @$el.removeClass('selectable')

  App.Collection.City = Backbone.Collection.extend
    model: App.Model.City

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
      </ul>
    """
    template: (c) -> Mustache.render @__template, c
    events:
      'click .action': 'takeAction'
    context: -> @model.toJSON()
    render: ->
      @$el.html @template _.result this, 'context'
    takeAction: (e) ->
      id = parseInt $(e.currentTarget).data('action'), 10
      Backbone.trigger 'rightPanel:actionTaken', id

  App.View.ActionListener = Backbone.View.extend
    initialize: ->
      _.bindAll(this)
      Backbone.on 'rightPanel:actionTaken', @rightPanelAction

    rightPanelAction: (id) ->
      if DRIVE <= id <= SHUTTLE_FLIGHT
        App.World.makeNodesSelectable()
      # if

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

      $('#right-panel-toggle').click (e) ->
        $(e.currentTarget).toggleClass('red')
        $('#right-panel').toggle()

      # World creates a basic graph from
      # cities and updates.
      App.World = new App.Model.World
        Regions: REGIONS
      App.World.initGraph()
      App.RightPanel = new App.View.RightPanel {model: App.World}
      App.RightPanel.render()
      App.ActionListener = new App.View.ActionListener()

    ###############################

    error: (msg) ->
      log msg

    ###############################

    bootstrap: (data) ->
      console.log(data)
      console.log('here')

      return if App.started

      # UI Shit

      initLogic(data)

    playTurn: (data) ->
      playTurn(data)

    takeAction: (actionId, options) ->
      return window.App.user.takeAction(actionId, options)



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
      App.started = true

    socket.on "message", (data) ->
      App.playTurn(data)

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
          'name': cardName
          'type': 'city card'
      player.set('cards', new App.Collection.Card(playerCards))

      # Set the location
      player.set('location', App.World.Cities[player.get('location')])

      appPlayers.push(player)

      if playerDict['clientId'] == userId
        App.user = player
    App.players = appPlayers

    # Create infection card deck.
    infectionDeck = []
    for name in data['infectionDeck']
      newCard = new App.Model.Card
        'name': name
        'type': 'infection'
      infectionDeck.push(newCard)
    App.infectionDeck = new App.Collection.Card(infectionDeck)

    # Create player card deck.
    playerDeck = []
    for name in data['playerDeck']
      newCard = new App.Model.Card
        'name': name
        'type':  if name.indexOf('EPIDEMIC') >= 0 then "epidemic" else "city card"
      playerDeck.push(newCard)
    App.playerDeck = new App.Collection.Card(playerDeck)

    # Finally initialize the discard piles ()
    App.infectionDiscard = new App.Collection.Card()
    App.playerDiscard = new App.Collection.Card()

    # Infect the initial cities.
    for cityName, numInfections of data['infections']
      #console.log(cityName + " " + numInfections)
      App.World.Cities[cityName].infect(numInfections)

    console.log("DONE WITH INIT")
    console.log(App)


  playTurn = (data) ->




