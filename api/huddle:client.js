/**
 * An instance of HuddleClient handles the connection to a Huddle engine through a
 * web socket connection. It offers properties to automatically reconnect on
 * connection errors. The device will get a continues stream of proximity data if
 * a connection to Huddle engine is established.
 *
 * The data stream is received as JSON stream in the following object literal:
 *
 * {"Type":"TYPE","Data":DATA}
 *
 * TYPE := Type of data, e.g., Proximity, Digital, or Broadcast
 * DATA := Data that represents the given type of data, e.g., for Proximity
 * {
 *   Type: "TYPE",               // a string e.g., Display or Hand
 *   Identity: "IDENTITY",       // a string that represents the HuddleClient id
 *   Location: double[3],        // values are [0;1], Location[0] = x, Location[1] = y, Location[2] = z
 *   Orientation: double,        // value is [0;360]
 *   Distance: double,           // value is [0;1] and only set for presences in Presences property.
 *   Movement: double,           // not yet implemented
 *   Presences: Proximity[],
 *   RgbImageToDisplayRatio: {
 *                              X: double,
 *                              Y: double
 *                           },
 * }
 *
 * @author Roman Rädle
 * @author Hans-Christian Jetter
 * @requires jQuery
 * @namespace Huddle
 * @param {int} Device id.
 */
Huddle = (function ($) {

    // Huddle client version
    this.version = "0.9.14";

    // set web socket
    var WebSocket = window.WebSocket || window.MozWebSocket;

    var DataTypes = {
        Glyph: "Glyph",
        IdentifyDevice: "Digital",
        ShowColor: "ShowColor",
        Proximity: "Proximity",
        Message: "Message"
    };

    var ProximityTypes = {
        Display: "Display",
        Hand: "Hand"
    };

    var glyph;

    /**
     * Creates a Huddle client with an optional name as parameter. The client
     * is set to automatically reconnect on error.
     *
     * @param {Object} [options] Client options. (e.g., name: does not
     * necessarily need to be a unique name.)
     */
    this.client = function (options) {

        this.options = {
            name: "undefined",
            glyphId: null,
        };
        $.extend(this.options, options);

        this.running = false;
        this.connected = false;
        this.reconnect = true;

        this.reconnectTimeout = null;

        this.identified = false;

        return this;
    };

    /**
     * Creates a glyph using the device id and returns the glyph as a base64
     * encoded image/png.
     *
     * @this Huddle
     * @private
     * @param {string} data Glyph data as a serial of 0/1.
     * @returns {string} Glyph as base64 encoded image/png.
     */
    var createGlyph = function (data) {

        var dim = Math.sqrt(data.length);
        var matrix = [];
        var cols = [];
        for (var j = 0; j < data.length; j++) {
            var c = parseInt(data[j]);

            if (j > 0 && j % dim == 0) {
                matrix.push(cols);
                cols = [];
            }

            cols.push(c);
        };
        matrix.push(cols);

        // for some glyph dimensions the glyph blocks are not connected tightly, therefore the
        // rendered glyph image needs to be tested after changing dimension
        var dimension = 840;
        var box = dimension / (matrix.length + 2);

        var canvas = document.createElement('canvas');
        canvas.width = dimension;
        canvas.height = dimension;

        var ctx = canvas.getContext("2d");

        for (var row = 0; row < matrix.length; row++) {
            for (var col = 0; col < matrix[row].length; col++) {
                ctx.fillStyle = matrix[row][col] ? "white" : "black";
                ctx.fillRect(box + (box * col), box + (box * row), box, box);
            }
        }

        var image = canvas.toDataURL("image/png");

        // delete canvas object
        delete canvas;

        return image;
    }.bind(this);

    /**
     * Connects to Huddle engine at host:port.
     *
     * @this Huddle
     * @param {string} host Web socket server host name.
     * @param {int} [port=4711] Web socket server port.
     */
    this.connect = function (host, port) {

        // security hack to ensure the socket is closed on window unload,
        // e.g., caused by a page or meteor reload
        window.onunload = function() {
          if (this.socket) {
            Log.info("Closing open web socket on window unload");
            this.socket.close();
          }
        }.apply(this);

        this.host = host;
        this.port = typeof port !== 'undefined' ? port : 1948;

        this.running = true;

        doConnect();

        return this;
    };

    /**
     * Connects to the web socket server. The host and port is given in the connection
     * function. In order to keep the web socket open it also will send an alive message
     * in an interval of 10 seconds to the server. If the connection drops it will
     * automatically re-establish connection if reconnect property is set to true.
     *
     * @this Huddle
     * @private
     */
    var doConnect = function () {

        // send alive message every 10 seconds, otherwise web socket server closes
        // connection automatically
        var sendAlive = function () {
            if (this.connected) {
                var content = '"Id": "{0}"'.format(this.id);
                send("Alive", content);
            }
        }.bind(this);
        var aliveInterval = null;

        var wsUri = "ws://{0}".format(this.host);
        if (this.port)
            wsUri = "{0}:{1}".format(wsUri, this.port);

        this.socket = new WebSocket(wsUri);

        this.socket.onopen = function () {
            Log.info("Huddle connection open");

            if (this.reconnectTimeout) {
                clearInterval(this.reconnectTimeout);
                this.reconnectTimeout = null;
            }

            this.connected = true;

            var deviceType = Common.getDeviceType();

            // set a short timeout before send the handshake (this avoids 'Uncaught InvalidStateError: Failed to execute 'send' on 'WebSocket': Still in CONNECTING state'.
            setTimeout(function () {
                // var content = '"Name": "{0}"'.format(this.name);
                // send("Handshake", content);

                var handshake = {
                  Name: this.options.name,
                  GlyphId: this.options.glyphId,
                  DeviceType: deviceType,
                  Options: this.options,
                };

                sendJSONObject("Handshake", handshake);
            }.bind(this), 500);

            // start alive interval to avoid web socket from disconnect
            aliveInterval = setInterval(sendAlive, 10000);
        }.bind(this);

        this.socket.onmessage = function (event) {
            //console.log("Huddle Message {0}".format(event));

            if (!event || !event.data) return;

            var data;
            try {
                data = JSON.parse(event.data);
            } catch (exception) {
                data = event.data;
            }

            if (!data) return;

            // call onData function with huddle object as this
            onData(data);
        }.bind(this);

        var onClose = function (event) {
            Log.info("Huddle Closed {0}".format(event));

            // Remove glyph on close.
            hideGlyph();

            // stop alive interval on error.
            if (aliveInterval) {
                clearInterval(aliveInterval);
            }

            this.connected = false;

            // TODO hide glyph

            if (this.running && this.reconnect && !this.reconnectTimeout) {
                this.reconnectTimeout = setInterval(function () {
                    // the socket still could be in a connection state if
                    // connection takes to long. Therefore, close socket.
                    if (this.socket) {
                        this.socket.close();
                        this.socket = null;
                    }

                    doConnect(this.host, this.port);
                }.bind(this), 1000);
            }
        }.bind(this);

        var onError = function (event) {
            Log.error("Huddle Error {0}".format(event));
        }.bind(this);

        this.socket.onclose = onClose;
        this.socket.onerror = onError;
    }.bind(this);

    /**
     * Disconnects from Huddle engine.
     *
     * @this Huddle
     */
    this.disconnect = function () {

        this.running = false;

        if (this.reconnectTimeout) {
            clearInterval(this.reconnectTimeout);
            this.reconnectTimeout = null;
        }

        if (this.socket)
            this.socket.close();

        return this;
    };

    /**
     * Receives the raw data stream from Huddle engine.
     *
     * @this Huddle
     * @private
     * @param {Object} data The proximity data as object literal.
     */
    var onData = function (data) {

        // handle pre-defined data types
        if (data.Type) {
            switch (data.Type) {
                case DataTypes.Glyph:
                    hideGlyph();
                    delete glyph;

                    this.id = data.Id;
                    glyph = createGlyph(data.GlyphData);

                    // DEBUG
                    // identifyDevice({ Value: true });
                    showGlyph();

                    return;
                case DataTypes.IdentifyDevice:
                    if (data.Data.Type && data.Data.Type == DataTypes.ShowColor)
                      showColor(data.Data);
                    else
                      identifyDevice(data.Data);
                    return;
                case DataTypes.Proximity:
                    updateProximity(data.Data);
                    return;
                case DataTypes.Message:
                    messageReceived(data.Event, data.Data);
                    return;
            }
        }

        // call undefined data function if data could not be handled by default handlers
        if (typeof (this.undefinedData) == "function") {
            this.undefinedData(data);
        }
    }.bind(this);

    /**
     * Shows a glyph in full screen if display is not identified in Huddle engine
     * otherwise remove glyph.
     *
     * @this Huddle
     * @private
     * @param {Object} data The digital data as object literal.
     */
    var identifyDevice = function (data) {

        if (this.identified != !data.Value) {
            this.identified = !data.Value;

            if (this.identified)
              EventManager.trigger("devicefound");
            else
              EventManager.trigger("devicelost");
        }

        if (data.Value) {
            showGlyph();
        }
        else {
            hideGlyph();
        }

        EventManager.trigger("identify", data);
    }.bind(this);

    /**
     * Shows the Huddle glyph.
     */
    var showGlyph = function() {

        // do not add a glyph container if it already exists
        if ($('#huddle-glyph-container').length)
            return;

        var $glyphContainer = $('<div id="huddle-glyph-container" class="huddle-glyph-container"></div>').appendTo($('body'));

        var $glyph = $('<div id="huddle-glyph-{0}" class="huddle-glyph"></div>'.format(this.id)).appendTo($glyphContainer);
        $glyph.css({
            "background-image": "url('" + glyph + "')"
        });
    }.bind(this);

    /**
     * Hides the Huddle glyph.
     */
    var hideGlyph = function() {
        $('#huddle-glyph-container').remove();
    }.bind(this);

    /**
     * Shows a colored background in full screen. This is a function that is required
     * by the experimental Huddle engine based on RGB tracking only.
     *
     * @this Huddle
     * @private
     * @param {Object} data The digital data as object literal.
     */
    var showColor = function (data) {
        if (data.Value) {

            // do not add a register container if it already exists
            if ($('#huddle-register-container').length)
                return;

            var $glyphContainer = $('<div id="huddle-register-container" class="huddle-register-container"></div>').appendTo($('body'));
            $glyphContainer.css({
                "background-color": data.Color,
            });
      }
      else {
          $('#huddle-register-container').remove();
      }

      // send acknowledge back to server to indicate that message was received
      sendJSONObject("Acknowledge", data);

      EventManager.trigger("showColor", data);
    }.bind(this);

    /**
       * The update proximity function is called each time a proximity data is received.
     *
     * @this Huddle
     * @private
     * @param {Object} data The proximity data as object literal.
     */
    var updateProximity = function (data) {
        EventManager.trigger("proximity", data);

        switch (data.Type) {
            case ProximityTypes.Display:
                EventManager.trigger("displaymove", data);
                break;
            case ProximityTypes.Hand:
                EventManager.trigger("handmove", data);
                break;
        }
    }.bind(this);

    /**
     * Called if broadcast message is of undefined data type. This function can be overriden if custom
     * data types are needed.
     *
     * @this Huddle
     * @private
     * @param {Object} data The undefined data as object literal.
     */
    var messageReceived = function (event, data) {
        EventManager.trigger(event, data);
    }.bind(this);

    /**
     * Called if data is of undefined data type. This function can be overriden if custom
     * data types are needed.
     *
     * @this Huddle
     * @private
     * @param {Object} data The undefined data as object literal.
     */
    var undefinedData = function (data) {
        // empty
    }.bind(this);

    /**
     * Broadcast message to other connected devices. The message is send to the web
     * socket server, which distributes it to all connected clients. Clients need to
     * listen explicitly to broadcast messages.
     *
     * @this Huddle
     * @param {string} event Event type.
     * @param {string} msg Message content.
     */
    this.broadcast = function (event, msg) {

        var content = msg;
        if (typeof(msg) === 'object') {
            try {
                content = JSON.stringify(msg);
            }
            catch (error) {
                Log.error("Unable to JSON.stringify message: " + error);
            }
        }

        send(DataTypes.Message, '"Event": "{0}", "Data": {1}'.format(event, content));
        return this;
    };

    /**
     * Send message to Huddle Engine.
     *
     * @this Huddle
     * @private
     * @param {string} type Message type.
     * @param {string} content Message content.
     */
    var send = function (type, content) {
        var msg = '{{"Type": "{0}", {1}}}'.format(type, content);
        this.socket.send(msg);
    }.bind(this);

    /**
     * Send JSON object stringified to Huddle Engine.
     *
     * @this Huddle
     * @private
     * @param {string} type Message type.
     * @param {Object} object JSON object.
     */
    var sendJSONObject = function(type, object) {
        var msg = '"Data": {0}'.format(JSON.stringify(object));
        send(type, msg);
    }.bind(this);

    /**
     * Adds a callback for the specified event.
     *
     * @this Huddle
     * @param {string} event Event name, e.g., proximity, identify, message
     * @param {function} callback Callback function receives object as parameter.
     */
    this.on = function (event, callback) {
        EventManager.register(event, callback);
        return this;
    };

    return this;
}).call({}, jQuery); //sweet! we can set this in an IIFE by passing in a blank object literal using the call method
