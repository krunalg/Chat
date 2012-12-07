ig.module('game.main')

.requires(

'impact.game',

'impact.font',

'game.position-dependent-animation',

'game.background-map',

// Chat log
'game.chat-log',

// Generated content
'game.border-check',

'game.special-tiles',

'game.background-animations',

'game.levels',

// Entities
'game.entities.grass',

'game.entities.persistent-grass',

'game.entities.tall-grass',

'game.entities.exit',

'game.entities.npc',

'game.entities.sign',

'game.entities.player',

'game.entities.local-player',

'game.entities.network-player',

'game.entities.sand-track',

'game.entities.reflection',

'game.entities.chat-bubble',

'game.entities.name',

'game.entities.jump',

'game.entities.surf',

'game.entities.rain-drop',

'game.entities.sand-cloud',

'game.entities.screen',

'game.entities.sand-screen',

'game.entities.ash-screen',

'game.entities.weather-controller',

'game.entities.tile-cursor',

'game.entities.camera-dodge',

'game.entities.camera-dodge-factory',

'game.entities.splash',

'game.entities.deep-sand',

'game.entities.ash-puff',

//debug
'impact.debug.debug',

// A plugin for getting username and other variables from the URL.
'plugins.url-variables',

// require the debug display plugin
'plugins.debug_display')

.defines(function() {

    MyGame = ig.Game.extend({

        // Keep resorting entities.
        autoSort: true,

        // The font used for the game text.
        whiteFont: new ig.Font('media/font.white.with.shadow.png'),

        // And array of game events such as players joining.
        events: new Array(),

        // Maximum amount of events to display on screen.
        eventsMax: 4,

        // Used for pruning old events.
        eventsTimer: null,

        // Time in seconds before clearing an event.
        eventsLifespan: 2,

        // Used to rebuild the player after zoning.
        lastSkin: 'boy',

        // Used to know where to place player when zoning.
        goTo: null,

        // Name of the current map.
        mapName: 'Town',

        // Name of may layer where checking for special tiles is done.
        primaryMapLayer: 'lower',

        // Walk through walls.
        noclip: false,

        /*
         * Chat system
         */

        // ID of HTML input element.
        inputFieldId: 'input',

        // Input in use or not.
        inputActive: false,

        // Has the current map finished loading?
        mapLoaded: false,

        loadLevel: function( data ) {

            this.parent(data);

            this.mapLoaded = true;
        },

        //        _____ _   _ _____ _______
        //       |_   _| \ | |_   _|__   __|
        //         | | |  \| | | |    | |
        //         | | | . ` | | |    | |
        //        _| |_| |\  |_| |_   | |
        //       |_____|_| \_|_____|  |_|
        //
        init: function() {

            // Define user name.
            if( typeof ig.urlVars.user === "undefined" ) {

                this.user = 'player' + Math.floor(Math.random()*999);

            } else {

                this.user = ig.urlVars.user;

            }

            // Create the chat log.
            this.chatLog = new ChatLog(540, 80, 'log');

            // Create a DebugDisplay and pass in your font.
            this.debugDisplay = new DebugDisplay(this.whiteFont);

            // Set up controls.
            ig.input.bind(ig.KEY.A, 'left');
            ig.input.bind(ig.KEY.D, 'right');
            ig.input.bind(ig.KEY.W, 'up');
            ig.input.bind(ig.KEY.S, 'down');
            ig.input.bind(ig.KEY.LEFT_ARROW, 'left');
            ig.input.bind(ig.KEY.RIGHT_ARROW, 'right');
            ig.input.bind(ig.KEY.UP_ARROW, 'up');
            ig.input.bind(ig.KEY.DOWN_ARROW, 'down');
            ig.input.bind(ig.KEY.ENTER, 'chatToggle');
            ig.input.bind(ig.KEY.R, 'chatReply');
            ig.input.bind(ig.KEY.Z, 'action');
            ig.input.bind(ig.KEY.X, 'run');
            ig.input.bind(ig.KEY.C, 'bike');
            ig.input.bind(ig.KEY.MOUSE1, 'mouse1');
            ig.input.bind(ig.KEY.MOUSE2, 'mouse2');
            ig.input.bind(ig.KEY.Q, 'cameraDodging');
            ig.input.bind(ig.KEY.N, 'noclip');

            // Set map animations from generated file.
            initBackgroundAnimations();

            // Authenticate username.
            socket.emit('init', this.user);

            // Load level server says to.
            socket.on('loadMap', function(map) {

                ig.game.mapLoaded = false;
                ig.game.loadLevelDeferred( ig.global['Level' + map] );

                // Get nearby players including the local player.
                socket.emit('getNearbyPlayers');
            });

            // Add nearby players to queue.
            socket.on('addNearbyPlayers', function(nearbyPlayers) {

                ig.game.playersToAdd = nearbyPlayers;
            });

            // Set the repeating border according to region.
            //BorderCheck(player.pos.x, player.pos.y);

            // Add camera dodging.
            ig.game.spawnEntity(EntityCameraDodgeFactory);
            this.cameraDodging = true;

            // Add tab index to canvas to ensure it retains focus.
            // Chrome needs this in order to focus on canvas after sending a message.
            $("#canvas").attr("tabindex", "0");

            // Tell the input field how to handle 'enter' keypress.
            $('#' + this.inputFieldId).bind('keypress', function(e) {

                // Read key code.
                var code = (e.keyCode ? e.keyCode : e.which);

                // Check for the 'enter' key.
                if (code == 13) {

                    // Submit input.
                    ig.game.chatInputOff();

                    // Set focus back to canvas.
                    $('#canvas').focus();
                }
            });

            // Custom ig.game.draw() function that draws reflections under the primary map layer.
            ig.Game.inject({
                draw: function() {
                    if (this.clearColor) {
                        ig.system.clear(this.clearColor);
                    }

                    // This is a bit of a circle jerk. Entities reference game._rscreen
                    // instead of game.screen when drawing themselfs in order to be
                    // "synchronized" to the rounded(?) screen position
                    this._rscreen.x = ig.system.getDrawPos(this.screen.x) / ig.system.scale;
                    this._rscreen.y = ig.system.getDrawPos(this.screen.y) / ig.system.scale;

                    var mapIndex;
                    for (mapIndex = 0; mapIndex < this.backgroundMaps.length; mapIndex++) {
                        var map = this.backgroundMaps[mapIndex];
                        if (map.name == ig.game.primaryMapLayer) {
                            // Need to draw special "below" entities, ie. reflections.
                            break;
                        }
                        map.setScreenPos(this.screen.x, this.screen.y);
                        map.draw();
                    }

                    var reflections = this.getEntitiesByType(EntityReflection);
                    if (reflections) {
                        for (var i = 0; i < reflections.length; i++) {
                            // Draw with true to really draw.
                            reflections[i].draw(true);
                        }
                    }

                    for (mapIndex; mapIndex < this.backgroundMaps.length; mapIndex++) {
                        var map = this.backgroundMaps[mapIndex];
                        if (map.foreground) {
                            // All foreground layers are drawn after the entities
                            break;
                        }
                        map.setScreenPos(this.screen.x, this.screen.y);
                        map.draw();
                    }

                    this.drawEntities();


                    for (mapIndex; mapIndex < this.backgroundMaps.length; mapIndex++) {
                        var map = this.backgroundMaps[mapIndex];
                        map.setScreenPos(this.screen.x, this.screen.y);
                        map.draw();
                    }
                }
            });

        },

        //    _    _ _____  _____       _______ ______
        //   | |  | |  __ \|  __ \   /\|__   __|  ____|
        //   | |  | | |__) | |  | | /  \  | |  | |__
        //   | |  | |  ___/| |  | |/ /\ \ | |  |  __|
        //   | |__| | |    | |__| / ____ \| |  | |____
        //    \____/|_|    |_____/_/    \_\_|  |______|
        //
        update: function() {

            // Things to do after map is loaded.
            if(this.mapLoaded) {

                // Add players.
                if (typeof this.playersToAdd !== 'undefined') {

                    for(var i = 0; i < this.playersToAdd.length; i++ ) {

                        var entityType = (this.playersToAdd[i].name.toLowerCase() == this.user.toLowerCase() ? EntityLocalPlayer : EntityNetworkPlayer);

                        ig.game.spawnEntity(entityType, this.playersToAdd[i].pos.x, this.playersToAdd[i].pos.y, {
                            name: this.playersToAdd[i].name,
                            facing: this.playersToAdd[i].facing,
                            skin: this.playersToAdd[i].skin,
                            moveState: this.playersToAdd[i].moveState
                        });
                    }

                    this.playersToAdd = undefined;
                }

                // Build borders look-up table for framerate improvement.
                if(typeof this.borderLookup === 'undefined') {

                    var buildTimer = new ig.Timer();

                    this.borderLookup = new Array();

                    var width = this.collisionMap.width;
                    var height = this.collisionMap.height;
                    var tilesize = this.collisionMap.tilesize;

                    for(var x=0; x<width; x++) {
                        for(var y=0; y<height; y++) {

                            if(typeof this.borderLookup[x] === 'undefined') {

                                this.borderLookup[x] = new Array();
                            }

                            this.borderLookup[x][y] = BorderCheck(x * tilesize, y * tilesize);
                        }
                    }

                    console.log("Built border lookup-table in " + buildTimer.delta() + " seconds.");
                }

            }

            // Toggle camera dodging.
            if (ig.input.pressed('cameraDodging')) this.cameraDodging = !this.cameraDodging;

            // Toggle no-clip.
            if (ig.input.pressed('noclip')) {

                this.noclip = !this.noclip;

                if(this.noclip) {

                    console.log("No-clip ON.");

                    // Disable collisions.
                    ig.CollisionMap.inject({
                        trace: function(x, y, vx, vy, objectWidth, objectHeight) {
                            // Return a dummy trace result, indicating that the object did not collide.
                            return {
                                collision: {
                                    x: false,
                                    y: false
                                },
                                pos: {
                                    x: x + vx,
                                    y: y + vy
                                },
                                tile: {
                                    x: 0,
                                    y: 0
                                }
                            };
                        }
                    });

                } else {

                    console.log("No-clip OFF.");

                    // Enable collisions.
                    ig.CollisionMap.inject({
                        trace: function( x, y, vx, vy, objectWidth, objectHeight ) {
                            // Set up the trace-result
                            var res = {
                                collision: {x: false, y: false, slope: false},
                                pos: {x: x, y: y},
                                tile: {x: 0, y: 0}
                            };

                            // Break the trace down into smaller steps if necessary
                            var steps = Math.ceil(Math.max(Math.abs(vx), Math.abs(vy)) / this.tilesize);
                            if( steps > 1 ) {
                                var sx = vx / steps;
                                var sy = vy / steps;

                                for( var i = 0; i < steps && (sx || sy); i++ ) {
                                    this._traceStep( res, x, y, sx, sy, objectWidth, objectHeight, vx, vy, i );

                                    x = res.pos.x;
                                    y = res.pos.y;
                                    if( res.collision.x ) { sx = 0; vx = 0; }
                                    if( res.collision.y ) { sy = 0; vy = 0; }
                                    if( res.collision.slope ) { break; }
                                }
                            }

                            // Just one step
                            else {
                                this._traceStep( res, x, y, vx, vy, objectWidth, objectHeight, vx, vy, 0 );
                            }

                            return res;
                        }
                    });
                }
            }

            // Update all entities and backgroundMaps
            this.parent();

            // Get local player entity.
            var player = this.getEntitiesByType(EntityLocalPlayer)[0];

            // Player exists; Control the camera.
            if (player) {

                // Screen centers on player.
                this.screen.x = player.pos.x - ig.system.width / 2 + player.size.x / 2;
                this.screen.y = player.pos.y - ig.system.height / 2;

                var factory = ig.game.getEntitiesByType(EntityCameraDodgeFactory)[0];

                // Get all camera dodges that are visible.
                if(typeof factory != 'undefined') var cameraDodges = factory.getDodges();

                // Camera dodging is enabled and there's at least one on screen.
                if (this.cameraDodging && typeof cameraDodges != 'undefined') {

                    var closest = {
                        index: undefined,
                        distance: undefined
                    };

                    for (var i = 0; i < cameraDodges.length; i++) {

                        // Get distance from player to camera dodge.
                        var distance = player.distanceTo(cameraDodges[i]);

                        // Is this the closest camera dodge so far?
                        if (i == 0 || distance < closest.distance) {

                            // Record closest camera dodge.
                            closest.distance = distance;
                            closest['index'] = i;
                        }
                    }

                    // Index of camera dodge entity?
                    if (typeof closest['index'] != 'undefined') {

                        var limitX = cameraDodges[closest['index']].limit.x;
                        var limitY = cameraDodges[closest['index']].limit.y;

                        if (typeof limitX != 'undefined') this.screen.x = limitX;
                        if (typeof limitY != 'undefined') this.screen.y = limitY;
                    }
                }
            }

            // Is player trying to chat?
            if (ig.input.pressed('chatToggle')) {

                // Make sure chat input isn't already open.
                if (!this.inputActive) {

                    // Make input visible.
                    $('#input').fadeIn(100);

                    // Set focus.
                    $('#input').focus();

                    // Prevent opening when it's already open.
                    this.inputActive = true;
                }
            }

            // Is the player trying to reply to someone?
            else if (ig.input.pressed('chatReply')) {

                // Open input to reply to who last messaged us.
                this.chatStartTell(ig.game.chatLog.lastTellFrom);
            }

            // Prune the events array.
            if (this.events.length > 0) {

                // Check if pruning timer exists.
                if (this.eventsTimer == null) {

                    // Create timer.
                    this.eventsTimer = new ig.Timer();

                    // Set time until an item will be pruned.
                    this.eventsTimer.set(this.eventsLifespan);
                }

                // Check if it's time to prune an item.
                else if (this.eventsTimer.delta() >= 0) {

                    // Remove the oldest event.
                    this.events.splice(0, 1);

                    // Remove timer until needed again.
                    this.eventsTimer = null;
                }

                // Keep events list within the maximum.
                while (this.events.length > this.eventsMax) {

                    // Remove oldest.
                    this.events.splice(0, 1);
                }
            }
        },

        //    _____  _____       __          __
        //   |  __ \|  __ \     /\ \        / /
        //   | |  | | |__) |   /  \ \  /\  / /
        //   | |  | |  _  /   / /\ \ \/  \/ /
        //   | |__| | | \ \  / ____ \  /\  /
        //   |_____/|_|  \_\/_/    \_\/  \/
        //
        draw: function() {

            // Draw all entities and backgroundMaps
            this.parent();

            // Array of entity types which will be drawn above map layers.
            var drawEntitiesAbove = new Array();

            // Names will be above map.
            drawEntitiesAbove.push(EntityName);

            // Chat-bubbles will be above map.
            drawEntitiesAbove.push(EntityChatBubble);

            // Draw certain entities above all map layers.
            this.reallyDraw(drawEntitiesAbove);

            // Add game events to this variable.
            var printEvents = '';

            // Traverse all game events.
            for (var i = 0; i < this.events.length; i++) {

                // Add new lines.
                var space = (i == 0 ? '' : "\n");

                // Add event to print.
                printEvents += space + this.events[i];
            }

            // Draw game events to screen.
            this.whiteFont.draw(printEvents, 3, 3, ig.Font.ALIGN.LEFT);

            // Enable extra debugging for just myself.
            if ( this.user == "Joncom") {

                var player = ig.game.getEntitiesByType(EntityLocalPlayer)[0];

                // Draw debug display.
                this.debugDisplay.draw(
                [
                //'moveState: ' + player.moveState,
                //'facing: ' + player.facing,
                //'lastFacing: ' + player.lastFacing,
                //'mouse-x: ' + ig.input.mouse.x,
                //'mouse-y: ' + ig.input.mouse.y
                ], // will display each array element on a new line
                true, // true or false to either show the FPS
                false, // true or false to show the average FPS over a period of time
                10000, // amount of of time between samples. defaults to 10000 (10 seconds)
                100 // amount of samples to take over time. defaults to 500
                );
            }
        },

        /*
         * Draws entities that were skipped because they need to be
         * drawn above all map layers.
         *
         * @param  entityTypes array     Types of entities to drawn.
         * @return             undefined
         */
        reallyDraw: function(entityTypes) {
            for (var i = 0; i < entityTypes.length; i++) {
                // Get all entities of this type.
                var entities = this.getEntitiesByType(entityTypes[i]);

                // Entities found.
                if (entities) {
                    // All entities.
                    for (var j = 0; j < entities.length; j++) {
                        // Really draw them this time.
                        entities[j].draw(true);
                    }
                }
            }
        },

        /*
         * Send a /say message to the server.
         *
         * @param  msg    string The message to send.
         * @return        undefined
         */
        emitSay: function(msg) {

            // Emit socket.
            socket.emit('receiveSay', msg);
        },

        /*
         * Send a private message to someone.
         *
         * @param  to  string Recepient of the message.
         * @param  msg string Message to send.
         * @return     undefined
         */
        emitTell: function(to, msg) {

            // Emit socket.
            socket.emit('receiveTell', to, msg);
        },

        /*
         * Send reskin message to the server.
         *
         * @param  skin string Name of the skin used.
         * @return      undefined
         */
        emitReskin: function(skin) {

            // Emit socket.
            socket.emit('receiveReskin', skin);
        },

        /*
         * Send /say message to the server and create a local chat-bubble.
         *
         * @param  playerName string    Name of the player message is from.
         * @param  message    string    Message to be send and displayed.
         * @return            undefined
         */
        chatSendSay: function(playerName, message) {

            // Checks that message contains non-whitespace.
            if (message.trim().length > 0) {

                // Get the local player entity.
                var player = this.getEntitiesByType(EntityLocalPlayer)[0];

                // Send message to server.
                this.emitSay(message);

                // Kill existing chat bubble.
                if (typeof player.chatBubble != 'undefined') {
                    player.chatBubble.kill();
                    player.chatBubble = undefined;
                }

                // Display new local chat bubble.
                player.chatBubble = ig.game.spawnEntity(
                EntityChatBubble, player.pos.x, player.pos.y, {

                    // Entity to follow.
                    follow: player,

                    // Message.
                    msg: message,
                });

                // HTML for chat log.
                var html = '<div class="say">[' + ig.game.chatNameHTML(playerName) + '] says: ' + message + '</div>';

                // Write to chat log.
                this.chatLog.push(html);
            }
        },

        /*
         * Send /tell message to the server and create a local chat-bubble.
         *
         * @param  recipient string    To whom the message is being sent.
         * @param  message   string    Message to be sent.
         * @return           undefined
         */
        chatSendTell: function(recipient, message) {

            // Checks that message contains non-whitespace.
            if (message.trim().length > 0) {

                // Send message to server.
                this.emitTell(recipient, message);

                // HTML for chat log.
                var html = '<div class="tell">To [' + ig.game.chatNameHTML(recipient) + ']: ' + message + '</div>';

                // Write to chat log.
                this.chatLog.push(html);
            }
        },

        /*
         * Begin composing a message with the recipient pre-filled out.
         *
         * @param  recipient string    Name of player to write to.
         * @return           undefined
         */
        chatStartTell: function(recipient) {

            // Make sure chat input isn't already open.
            if (!this.inputActive) {

                // Add space after name.
                var spaceAfterName = (recipient != '' ? ' ' : '');

                // Set inital message.
                $('#' + this.inputFieldId).val('/tell ' + recipient + spaceAfterName);

                // Make input visible.
                $('#input').fadeIn(100);

                // Prevent opening when it's already open.
                this.inputActive = true;
            }

            // Chat's already open, injecting /tell.
            else {

                // Get input field content.
                var input = $('#' + this.inputFieldId).val();

                // Break apart to find commands.
                var inputParts = input.split(' ');

                // Check if command has been typed.
                if (inputParts[0].charAt(0) == '/') {

                    // Check if replacing or adding .
                    if (inputParts[0] == '/say' || inputParts[0] == '/s') {

                        // No recipient to replace.
                        inputParts.splice(1, 0, recipient);
                    }

                    // Replacing.
                    else {

                        // Replace the recipient.
                        inputParts[1] = recipient;
                    }

                    // Update the command.
                    inputParts[0] = '/tell';

                    // Rebuild input.
                    var newInput = '';
                    for (var i = 0; i < inputParts.length; i++) {

                        // Prepend a space except the very first time.
                        if (i != 0) newInput += ' ';

                        // Add next word.
                        newInput += inputParts[i];
                    }

                    // If name is the last part, space is needed.
                    var spaceOrNot = (inputParts.length <= 2 ? ' ' : '');

                    // Add space if needed.
                    newInput += spaceOrNot;
                }

                // No command typed, prepend /tell.
                else {

                    // Determine if space needed after name.
                    var spaceOrNot = (input.charAt(0) == ' ' ? '' : ' ');

                    // Rebuild input.
                    var newInput = '/tell ' + recipient + spaceOrNot + input;
                }

                // Use new input.
                $('#' + this.inputFieldId).val(newInput);
            }

            // Set focus.
            $('#input').focus();

        },

        /*
         * Return a HTML clickable name for fast-replying.
         *
         * @param  name string    Name of player.
         * @return      undefined
         */
        chatNameHTML: function(name) {

            // Clickable name.
            return '<a onclick="ig.game.chatStartTell(\'' + name + '\');">' + name + '</a>';
        },

        /*
         * Processes whatever text has been typed in chat input and disable input.
         *
         * @return undefined
         */
        chatInputOff: function() {

            // Get any content from the input element.
            var inputVal = $('#' + this.inputFieldId).val();

            // Check if user has typed something.
            if (inputVal != '') {

                // Get the local player entity.
                var player = this.getEntitiesByType(EntityLocalPlayer)[0];

                // Check first character to see if input is command.
                if (inputVal.substr(0, 1) == '/') {

                    // Break the input string by spaces.
                    var explodeInput = inputVal.split(' ');

                    // Check for commands: /tell or /t
                    if (explodeInput[0] == '/tell' || explodeInput[0] == '/t') {

                        // Get recipient of message.
                        var to = explodeInput[1];

                        // Will store message in this variable.
                        var msg = '';

                        // Reconstruct message.
                        for (i = 2; i < explodeInput.length; i++) {

                            // Prepend space if not the first word.
                            var spaceOrNot = (i == 2) ? '' : ' ';

                            // Add next word.
                            msg += spaceOrNot + explodeInput[i];
                        }

                        // Send message to server.
                        this.chatSendTell(to, msg);
                    }
                    // Check for commands: /say or /s
                    else if (explodeInput[0] == '/say' || explodeInput[0] == '/s') {

                        // Check if command is: /say
                        if (inputVal.substr(0, 4) == '/say') {
                            // Strip command and first space from input.
                            inputVal = inputVal.substr(5, inputVal.length - 5);
                        }
                        // Check if command is: /s
                        else if (inputVal.substr(0, 2) == '/s') {
                            // Strip command and first space from input.
                            inputVal = inputVal.substr(3, inputVal.length - 3);
                        }

                        // Send message to server.
                        this.chatSendSay(player.name, inputVal);

                    }
                    // Check for command: /skin
                    else if (explodeInput[0] == '/skin') {

                        // Get skin name from input.
                        var skin = explodeInput[1];

                        // Set new skin.
                        player.skin = skin;

                        // Load new skin.
                        player.reskin();

                        // Store skin for rebuilding player.
                        this.lastSkin = skin;

                        // Tell server about skin change.
                        this.emitReskin(skin);
                    }

                    // Invalid command.
                    else {

                        ig.game.chatLog.push('<div class="error">' + explodeInput[0] + ' is not a valid command.</div>');

                    }
                }
                // Assume it's a /say
                else {
                    // Send message to server.
                    this.chatSendSay(player.name, inputVal);
                }


            }

            // Blank the input field.
            $('#' + this.inputFieldId).val('');

            // Hide the input field.
            $('#' + this.inputFieldId).hide();

            // Disable input.
            this.inputActive = false;
        },

        /*
         * Changes the current map.
         *
         * @param  map  string Name of the map to load.
         * @param  goTo int    ID of exit to start player at.
         * @return      undefined
         */
        zone: function(map, goTo) {
            // Used to find where player starts in next map.
            this.goTo = goTo;

            // Name of map.
            this.mapName = this.capitaliseFirstLetter(map);

            // Tell other players that we left.
            this.leaveZone();

            // Change areas.
            this.loadLevelDeferred(ig.global['Level' + this.mapName]);
        },

        /*
         * Tell the server that we have left the area.
         *
         * @return      undefined
         */
        leaveZone: function() {

            // Send to socket.
            socket.emit('playerLeaveZone');
        },

        /*
         * Changes the current map.
         *
         * @param  map  string Name of the map to load.
         * @param  goTo int    ID of exit to start player at.
         * @return      undefined
         */
        zone: function(map, goTo) {
            // Used to find where player starts in next map.
            this.goTo = goTo;

            // Name of map.
            this.mapName = this.capitaliseFirstLetter(map);

            // Tell other players that we left.
            this.leaveZone();

            // Change areas.
            this.loadLevelDeferred(ig.global['Level' + this.mapName]);
        },

        /*
         * Tell the server that we have left the area.
         *
         * @return      undefined
         */
        leaveZone: function() {

            // Send to socket.
            socket.emit('playerLeaveZone');
        },

        /*
         * Same thing as spawnEntity() but adds new entity to top of array, not the end.
         *
         * @param  type     string/entityClass Name of entity sub class.
         * @param  x        integer Pixel position on x-axis.
         * @param  y        integer Pixel position on y-axis.
         * @param  settings object Initial variables.
         * @return          entityClass on success, undefined otherwise.
         */
        spawnEntityBelow: function(type, x, y, settings) {
            var entityClass = typeof(type) === 'string' ? ig.global[type] : type;

            if (!entityClass) {
                throw ("Can't spawn entity of type " + type);
            }
            var ent = new(entityClass)(x, y, settings || {});
            this.entities.splice(0, 0, ent);
            if (ent.name) {
                this.namedEntities[ent.name] = ent;
            }
            return ent;
        },

        /*
         * Returns the argument string with first character converted to a capital.
         *
         * @param  string string Text to alter the first character of.
         * @return        string Text which has had it's first character changed
         *                       to an upper case letter.
         */
        capitaliseFirstLetter: function(string) {

            // Return the word with it's first character upper case'd.
            return string.charAt(0).toUpperCase() + string.slice(1);
        },

        /*
         * Returns true if any tiles within 'tiles' are found at x, y
         * on the map layer named 'layer'.
         *
         * @param  x     int Position on x-axis in tiles.
         * @param  y     int Position on y-axis in tiles.
         * @param  tiles array Tiles to check for.
         * @param  layer string Name of layer containing tile.
         * @return bool  true if tile is queried type, else false.
         */
        isSpecialTile: function(x, y, tiles, layer) {

            if(typeof tiles !== 'undefined') {

                // Get map by name.
                var map = this.getMapByName(layer);

                // Map found.
                if (map) {

                    // Try all tiles for a match.
                    for (var j = 0; j < tiles.length; j++) {

                        // Outside of map.
                        if (typeof map['data'][y] == 'undefined') return false;

                        // Check if current match the one in the map.
                        if (tiles[j] == map['data'][y][x]) {
                            // Match found.
                            return true;
                        }
                    }
                }
            }

            // No matches.
            return false;
        }

    });

    // Start the game.
    ig.main('#canvas', MyGame, 60, 360, 240, 2);

});