$ ->

  # Keep reference to Context
  window.Game = this

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


  curedDiseases = []
  infection =
    location: 1
    disease: RED

  researchCenter =
    location: 1
    disease: BLUE

  playerBasicActions = [DRIVE, DIRECT_FLIGHT, CHARTER_FLIGHT, SHUTTLE_FLIGHT, PASS]
  playerSpecialActions = [DISPATCH, BUILD_RESEARCH_CENTER, DISCOVER_CURE, TREATMENT, SHARE_KNOWLEDGE]
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

      "Mexico City":
        connections: ["Los Angeles", "Chicago", "Miami", "Bogota", "Lima"]

      Miami:
        connections: ["Mexico City", "Atlanta", "Washington", "Bogota"]

      Bogota:
        connections: ["Mexico City", "Miami", "Sao Paulo", "Buenos Aires", "Lima"]

      Lima:
        connections: ["Mexico City", "Bogota", "Santiago"]

      Santiago:
        connections: ["Lima"]

      "Buenos Aires":
        connections: ["Bogota", "Sao Paulo"]

      "Sao Paulo":
        connections: ["Bogota", "Madrid", "Lagos", "Buenos Aires"]

      Lagos:
        connections: ["Sao Paulo", "Khartoum", "Kinshasa"]

      Khartoum:
        connections: ["Lagos", "Cairo", "Johannesburg", "Kinshasa"]

      Kinshasa:
        connections: ["Lagos", "Khartoum", "Johannesburg"]

      Johannesburg:
        connections: ["Kinshasa", "Khartoum"]

    BLACK:
      Moscow:
        connections: ["Tehran", "Istanbul", "St. Petersburg"]

      Tehran:
        connections: ["Moscow", "Baghdad", "Karachi", "Delhi"]

      Istanbul:
        connections: ["St. Petersburg", "Moscow", "Milan", "Baghdad", "Algiers", "Cairo"]

      Delhi:
        connections: ["Tehran", "Karachi", "Kolkata", "Mumbai", "Chennai"]

      Baghdad:
        connections: ["Tehran", "Istanbul", "Karachi", "Cairo", "Riyadh"]

      Karachi:
        connections: ["Tehran", "Delhi", "Baghdad", "Riyadh", "Mumbai"]

      Kolkata:
        connections: ["Delhi", "Chennai", "Bangkok", "Hong Kong"]

      Algiers:
        connections: ["Madrid", "Paris", "Istanbul", "Cairo"]

      Cairo:
        connections: ["Algiers", "Istanbul", "Baghdad", "Riyadh", "Khartoum"]

      Riyadh:
        connections: ["Cairo", "Baghdad", "Karachi"]

      Mumbai:
        connections: ["Karachi", "Delhi", "Chennai"]

      Chennai:
        connections: ["Mumbai", "Delhi", "Kolkata", "Bangkok", "Jakarta"]

    RED:
      Beijing:
        connections: ["Shanghai", "Seoul"]

      Seoul:
        connections: ["Beijing", "Shanghai", "Tokyo"]

      Tokyo:
        connections: ["Shanghai", "Seoul", "Osaka", "San Francisco"]

      Shanghai:
        connections: ["Beijing", "Seoul", "Tokyo", "Taipei", "Hong Kong"]

      Osaka:
        connections: ["Tokyo", "Taipei"]

      Taipei:
        connections: ["Shanghai", "Osaka", "Hong Kong", "Manila"]

      "Hong Kong":
        connections: ["Kolkata", "Shanghai", "Taipei", "Manila", "Ho Chi Minh City", "Bangkok"]

      Bangkok:
        connections: ["Kolkata", "Chennai", "Hong Kong", "Ho Chi Minh City", "Jakarta"]

      "Ho Chi Minh City":
        connections: ["Jakarta", "Bangkok", "Hong Kong", "Manila"]

      Manila:
        connections: ["Ho Chi Minh City", "Hong Kong", "Taipei", "San Francisco", "Sydney"]

      Jakarta:
        connections: ["Chennai", "Bangkok", "Ho Chi Minh City", "Sydney"]

      Sydney:
        connections: ["Jakarta", "Manila", "Los Angeles"]

    BLUE:
      "San Francisco":
        connections: ["Tokyo", "Manila", "Chicago", "Los Angeles"]

      Chicago:
        connections: ["San Francisco", "Los Angeles", "Mexico City", "Atlanta", "Toronto"]

      Toronto:
        connections: ["Chicago", "New York", "Washington"]

      "New York":
        connections: ["Toronto", "Washington", "London", "Madrid"]

      Washington:
        connections: ["Atlanta", "Toronto", "New York", "Miami"]

      Atlanta:
        connections: ["Chicago", "Washington", "Miami"]

      London:
        connections: ["New York", "Essen", "Madrid", "Paris"]

      Essen:
        connections: ["London", "Paris", "Milan", "St. Petersburg"]

      "St. Petersburg":
        connections: ["Essen", "Istanbul", "Moscow"]

      Madrid:
        connections: ["New York", "London", "Paris", "Sao Paulo", "Algiers"]

      Paris:
        connections: ["Madrid", "London", "Essen", "Milan", "Algiers"]

      Milan:
        connections: ["Paris", "Essen", "Istanbul"]

  # World creates a basic graph from
  # cities and updates.
  world = new World
    Regions: REGIONS

  World = Backbone.Model.extend
    initialize: (options) ->
      initGraph()

    # Link to cities for each
    initGraph: ->
      @_internal = {}
      _.each @Regions, (Region) ->
        _.each Region, (City, name) ->
          @_internal[name] = City
          City.initConnections()


  Card = Backbone.Model.extend

  CardView = Backbone.Model.extend
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

  City = Backbone.Model.extend
    initialize: ->
      @set "researchCenter", 0
      @set "diseaseCubes", 0

    initConnections: ->
      _.each @get("connections"), ->

    infect: ->
      @addDiseaseCubes 1
      if @get("diseaseCubes") > 3
        _.each @get("connections"), ->
          connections.infect()

    addDiseaseCubes: (num) ->
      @set "diseaseCubes", @get("diseaseCubes") + num

  CityView = Backbone.View.extend
    tagName: "div"
    className: "cityview"
    __template: """
      <div class="sphere {{color}}"></div>
    """
    template: (c) -> Mustache.render @__template, c
    render: ->
      @$el.html @template _.result this, 'context'
    context: ->
      color: ''

  RightPanel = Backbone.View.extend
    el: '#right-panel'
    __template: """

    """
    template: (c) -> Mustache.render @__template, c
    context: ->
      @model.toJSON()
    render: ->
      @$el.html @template _.result this, 'context'

  #
  # Async bootstrap
  #
  App =
    init: (cb) ->

      # Geo locate
      if navigator.geolocation

        # navigator.geolocation.getCurrentPosition(cb, this.error);
        navigator.geolocation.watchPosition cb, @error
      else
        error "not supported"

    error: (msg) ->
      log msg