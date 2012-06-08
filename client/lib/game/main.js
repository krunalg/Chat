ig.module('game.main')

.requires(

'impact.game',

'impact.font',

// Chat log
'game.chat-log',

'game.background-animations',

'game.position-dependent-animation',

'game.update-border',

'game.special-tiles',

// Levels
'game.levels.test',

'game.levels.town',

'game.levels.route101',

'game.levels.lab',

'game.levels.birchdownstairs',

'game.levels.birchupstairs',

'game.levels.homedownstairs',

'game.levels.homeupstairs',

// Entities
'game.entities.grass',

'game.entities.exit',

'game.entities.npc',

'game.entities.sign',

'game.entities.non-weltmeister.player',

'game.entities.non-weltmeister.local-player',

'game.entities.non-weltmeister.network-player',

'game.entities.non-weltmeister.bubble',

'game.entities.non-weltmeister.name',

'game.entities.non-weltmeister.jump',

'game.entities.non-weltmeister.surf',

//debug
'impact.debug.debug',

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

		// First level to load.
		defaultLevel: LevelTown,

		// Starting position X.
		defaultXStart: 256,

		// Starting position Y.
		defaultYStart: 256,

		// Starting faced direction.
		defaultFacing: 'down',

		// Used to rebuild the player after zoning.
		lastSkin: 'boy',

		// Used to know where to place player when zoning.
		goTo: null,

		// Name of the current map.
		mapName: 'Town',

		/*
		 * Chat system
		 */

		// ID of HTML input element.
		inputFieldId: 'input',

		// Input in use or not.
		inputActive: false,

		//		  _____ _   _ _____ _______ 
		//		 |_   _| \ | |_   _|__   __|
		//		   | | |  \| | | |    | |   
		//		   | | | . ` | | |    | |   
		//		  _| |_| |\  |_| |_   | |   
		//		 |_____|_| \_|_____|  |_| 
		//		 
		init: function() {

			// Create the chat log.
			this.chatLog = new ChatLog(540, 80, 'log');

			// Create a DebugDisplay and pass in your font.
			this.debugDisplay = new DebugDisplay(this.whiteFont);

			// Start a connection with the socket server.
			socket.emit('init', username);

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

			/*
			// OLD: Set up map animations.
			var as = new ig.AnimationSheet('media/bg-flower.png', 16, 16);
			this.backgroundAnims = {
				'media/starter-towna.png': {
					// flower
					4: new ig.Animation(as, 0.26667, [0, 1, 0, 2]) // 16 frames out of 60 per
				}
			};
			*/

			// Set map animations from generated file.
			initBackgroundAnimations();

			// Load the level.
			this.loadLevel(this.defaultLevel);

			// Create the local player.
			var player = this.buildPlayer();

			// Set the repeating border according to region.
			updateBorder(player);

			// Add tab index to canvas to ensure it retains focus (Chrome needs this!)
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
		},

		//	  _    _ _____  _____       _______ ______ 
		//	 | |  | |  __ \|  __ \   /\|__   __|  ____|
		//	 | |  | | |__) | |  | | /  \  | |  | |__   
		//	 | |  | |  ___/| |  | |/ /\ \ | |  |  __|  
		//	 | |__| | |    | |__| / ____ \| |  | |____ 
		//	  \____/|_|    |_____/_/    \_\_|  |______|
		//	                                           	
		update: function() {
			// Update all entities and backgroundMaps
			this.parent();

			// Local player entity does not exist (after map change).
			if (!this.getEntitiesByType(EntityLocalPlayer)[0]) {

				// Spawn new local player entity.
				var player = this.buildPlayer();

				// Debug message.
				console.debug("Player does not exist. Adding one.");
			}
			// Local player exists.
			else {
				// Get local player entity.
				var player = this.getEntitiesByType(EntityLocalPlayer)[0];
			}

			// Player exists.
			if (player) {

				// Screen centers on player.
				this.screen.x = player.pos.x - ig.system.width / 2 + player.size.x / 2;
				this.screen.y = player.pos.y - ig.system.height / 2;
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

		//	  _____  _____       __          __
		//	 |  __ \|  __ \     /\ \        / /
		//	 | |  | | |__) |   /  \ \  /\  / / 
		//	 | |  | |  _  /   / /\ \ \/  \/ /  
		//	 | |__| | | \ \  / ____ \  /\  /   
		//	 |_____/|_|  \_\/_/    \_\/  \/    
		//	                                   
		draw: function() {
			
			// Draw all entities and backgroundMaps
			this.parent();

			// Array of entity types which will be drawn above map layers.
			var drawEntitiesAbove = new Array();

			// Names will be above map.
			drawEntitiesAbove.push(EntityName);

			// Chat bubbles will be above map.
			drawEntitiesAbove.push(EntityBubble);

			// Draw certain entities above all map layers.
			this.reallyDraw(drawEntitiesAbove);

			// Add game events to this variable.
			var printEvents = '';

			// Traverse all game events.
			for (var i = 0; i < this.events.length; i++) {
				
				// Add new lines.
				var space = (i==0 ? '' : "\n");

				// Add event to print.
				printEvents += space + this.events[i];
			}

			// Draw game events to screen.
			this.whiteFont.draw(printEvents, 3, 3, ig.Font.ALIGN.LEFT);

			// Enable extra debugging for just myself.
			if (username == "Joncom") {

				// Draw debug display.
				this.debugDisplay.draw(
				[this.mapName], // will display each array element on a new line
				true, // true or false to either show the FPS
				false, // true or false to show the average FPS over a period of time
				10000, // amount of of time between samples. defaults to 10000 (10 seconds)
				100 // amount of samples to take over time. defaults to 500
				);

				// Disable collisions
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
			}
		},

		/*
		 * Draws entities that were skipped because they need to be 
		 * drawn above all map layers.
		 *
		 * @param  entityTypes array     Types of entities to drawn.
		 * @return             undefined
		 */
		reallyDraw: function(entityTypes)
		{
			for(var i=0; i<entityTypes.length; i++)
			{
				// Get all entities of this type.
				var entities = this.getEntitiesByType(entityTypes[i]);

				// Entities found.
				if(entities)
				{
					// All entities.
					for(var j=0; j<entities.length; j++)
					{
						// Really draw them this time.
						entities[j].draw(true);
					}
				}
			}
		},

		/*
		 * Send a /say message to the server.
		 *
		 * @param  client string Name of player message is from.
		 * @param  msg    string The message to send.
		 * @return        undefined
		 */
		emitSay: function(client, msg) {

			// Emit socket.
			socket.emit('receiveSay', client, msg);
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
		 * Send /say message to the server and create a local chat bubble.
		 *
		 * @param  playerName string    Name of the player message is from.
		 * @param  message    string    Message to be send and displayed.
		 * @return            undefined
		 */
		chatSendSay: function(playerName, message) {
			// Get the local player entity.
			var player = this.getEntitiesByType(EntityLocalPlayer)[0];

			// Send message to server.
			this.emitSay(playerName, message);

			// Display message locally.
			ig.game.spawnEntity(
			EntityBubble, player.pos.x, player.pos.y, {

				// Entity to follow.
				follow: player,

				// Message.
				msg: message,
			});

			// HTML for chat log.
			var html = '<div class="say"><span class="name">[' + playerName + ']</span> says: ' + message + '</div>';
			
			// Write to chat log.
			this.chatLog.push(html);
		},

		/*
		 * Send /tell message to the server and create a local chat bubble.
		 *
		 * @param  recipient string    To whom the message is being sent.
		 * @param  message   string    Message to be sent.
		 * @return           undefined
		 */
		chatSendTell: function(recipient, message) {
			
			// Send message to server.
			this.emitTell(recipient, message);

			// HTML for chat log.
			var html = '<div class="tell">To <span class="name">[' + recipient + ']</span>: ' + message + '</div>';
			
			// Write to chat log.
			this.chatLog.push(html);
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

				// Set inital message.
				$('#' + this.inputFieldId).val('/tell ' + recipient);

				// Make input visible.
				$('#input').fadeIn(100);

				// Set focus.
				$('#input').focus();

				// Prevent opening when it's already open.
				this.inputActive = true;
			}
			
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
						for (i = 2; i < explodeInput.length; i++) msg += explodeInput[i];

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
		 * @return bool	 true if tile is queried type, else false.
		 */
		isSpecialTile: function(x, y, tiles, layer) {

			// Get map by name.
			var map = this.getMapByName(layer);

			// Map found.
			if (map) {
				// Try all tiles for a match.
				for (var j = 0; j < tiles.length; j++) {

					// Check if current match the one in the map.
					if (tiles[j] == map['data'][y][x]) {
						// Match found.
						return true;
					}
				}
			}

			// No matches.
			return false;
		},

		/*
		 * Spawns a local-player entity.
		 *
		 * @return      undefined
		 */
		buildPlayer: function() {

			// Initialize a couple variables.
			var x = 0;
			var y = 0;
			var direction = '';

			// "Walk out a door" animation.
			var exitAnimation = false;

			// Check if there is someplace to put the player.
			if (this.goTo == null) {

				// Debug message.
				console.debug("First time building player.");

				// Use default X.
				x = this.defaultXStart;

				// Use default Y.
				y = this.defaultYStart;

				// Use default direction.
				direction = this.defaultFacing;
			}
			// Found a place to start the player.
			else {

				// Debug message.
				console.debug("Rebuilding player using map exit values.");

				// Get all exit entities.
				var exits = ig.game.getEntitiesByType(EntityExit);

				// Found exit entities.
				if (EntityExit) {
					for (var i = 0; i < exits.length; i++) {

						// Check for correct ID.
						if (exits[i].me == this.goTo) {

							// Check if exit is a door.
							if (exits[i].type == 'door') {

								// Enable player door-exit animation.
								exitAnimation = true;

								// Leaving doors always goes down.
								direction = 'down';

							}
							// Exit must be a floor exit.
							else {
								// !! FIX THIS: should be remembered and recalled instead.
								direction = 'up';
							}

							// Place player at position of exit.
							x = exits[i].pos.x;
							y = exits[i].pos.y;
						}
					}
				}

				// Reset goTo for next map change.
				this.goTo = null;
			}

			// Spawn player.
			return ig.game.spawnEntity(EntityLocalPlayer, x, y, // magic numbers = bad
			{
				// Use username as name.
				name: username,

				// Set faced direction.
				facing: direction,

				// Set whether player is waiting to move or not.
				waitingToMove: exitAnimation,

				// Set when to move (even if player won't actually move).
				moveWhen: 336.7 + new Date().getTime(),

				// Set appearance.
				skin: this.lastSkin
			});
		}

		
	});

	// Start the game.
	ig.main('#canvas', MyGame, 60, 360, 240, 2);

});