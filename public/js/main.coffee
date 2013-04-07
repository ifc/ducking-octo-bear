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

  DRIVE           = 1
  DIRECT_FLIGHT   = 2
  CHARTER_FLIGHT  = 3
  SHUTTLE_FLIGHT  = 4
  PASS            = 5

  DISPATCH              = 1
  BUILD_RESEARCH_CENTER = 2
  DISCOVER_CURE         = 3
  TREAT_DISEASE         = 4
  SHARE_KNOWLEDGE       = 5


  curedDiseases = []
  infection =
    location: 1
    disease: RED

  researchCenter =
    location: 1
    disease: BLUE

  playerBasicActions = [DRIVE, DIRECT_FLIGHT, CHARTER_FLIGHT, SHUTTLE_FLIGHT, PASS]
  playerSpecialActions = [DISPATCH, BUILD_RESEARCH_CENTER, DISCOVER_CURE, TREAT_DISEASE, SHARE_KNOWLEDGE]
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
          top: 30
          left: 40

      "Mexico City":
        connections: ["Los Angeles", "Chicago", "Miami", "Bogota", "Lima"]
        css:
          top: 50
          left: 60

      Miami:
        connections: ["Mexico City", "Atlanta", "Washington", "Bogota"]
        css:
          top: 30
          left: 40

      Bogota:
        connections: ["Mexico City", "Miami", "Sao Paulo", "Buenos Aires", "Lima"]
        css:
          top: 30
          left: 40

      Lima:
        connections: ["Mexico City", "Bogota", "Santiago"]
        css:
          top: 30
          left: 40

      Santiago:
        connections: ["Lima"]
        css:
          top: 30
          left: 40

      "Buenos Aires":
        connections: ["Bogota", "Sao Paulo"]
        css:
          top: 30
          left: 40

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
          top: 30
          left: 40

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

  App.Model.Card = Backbone.Model.extend

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

  App.Collection.City = Backbone.Collection.extend
    model: App.Model.City

  App.View.RightPanel = Backbone.View.extend
    el: '#right-panel'
    __template: """
      <h1>
    """
    template: (c) -> Mustache.render @__template, c
    context: -> @model.toJSON()
    render: -> @$el.html @template _.result this, 'context'
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

    ###############################

    error: (msg) ->
      log msg

    ###############################

    bootstrap: (data) ->
      console.log(data)
      console.log('here')

      return if App.started

      # UI Shit
      #right_panel = new RightPanel
      #  model: App.World

      initLogic(data)

    playTurn: (data) ->
      playTurn(data)

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

    # Infect the initiali cities.
    for cityName, numInfections of data['infections']
      #console.log(cityName + " " + numInfections)
      App.World.Cities[cityName].infect(numInfections)


  playTurn = (data) ->




