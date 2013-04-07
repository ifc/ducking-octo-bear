
  #
  # Async bootstrap. App is only global object
  #
  # App.Socket
  # App.World
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

    bootstrap: (data) ->
      log data
      return if App.started

      # World creates a basic graph from
      # cities and updates.
      App.World = new World
        Regions: REGIONS

      # UI Shit
      right_panel = new RightPanel
        model: World

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

    socket.on "boostrap", (data) ->
      App.bootstrap(data)
      App.started = true

    socket.on "message", (data) ->
      App.playTurn(data)

  initLogic = (data) ->

  playTurn = (data) ->



# App.init