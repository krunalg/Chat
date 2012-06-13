ig.module(

'game.entities.non-weltmeister.local-player')

.requires(

'game.entities.non-weltmeister.player')

.defines(function() {

	EntityLocalPlayer = EntityPlayer.extend({

		// Layering priority relative to other entities.
		zPriority: 3,

		// Does the local keyboard move the player?
		controlledByLocalKeyboard: true,

		// Used to send network move update when move state changes.
		lastState: '',

		// Used to send network move update when faced direction changes.
		lastFacing: '',

		// Waiting for a door to open.
		waitingToMove: false,

		// System time (in miliseconds) to for before moving.
		moveWhen: 0,

		// Exit entity to trigger after waiting and then moving.
		moveDoor: false,

		// Used to decide if a move or just a direction change occurs.
		moveCommitPending: false,

		// System time (in miliseconds) when player will commit to a move.
		moveCommitWhen: 0,

		// Used to reset time before committing if direction changes.
		moveCommitDirection: '',

		// Tell server where in the world the player is and what he looks like.
		netInit: function() {

			// Emit socket.
			socket.emit('hereIAm', this.pos.x, this.pos.y, this.facing, ig.game.mapName, this.skin);
		},

		// Tell server that the player just changes his movement state.
		emitUpdateMoveState: function(x, y, direction, state) {

			// Debug message.
			console.debug('Sending move-update... x: ' + x + ', y: ' + y + ', direction: ' + direction + ', state: ' + state);

			// Emit socket.
			socket.emit('receiveUpdateMoveState', x, y, direction, state);
		},

		// Determine if player should continue moving or stop.
		continueOrStop: function() {

			// Assume we will keep moving unless told otherwise.
			var keepMoving = true;

			// Check if player is pressing down the movement key.
			if (this.moveKeyDown('left')) this.facing = 'left';
			else if (this.moveKeyDown('right')) this.facing = 'right';
			else if (this.moveKeyDown('up')) this.facing = 'up';
			else if (this.moveKeyDown('down')) this.facing = 'down';
			else {
				// Player is no longer trying to move.
				keepMoving = false;
			}

			// Try to keep moving.
			if (keepMoving) {

				if (this.canJump()) {
					this.moving = false; // will use jumping instead
					this.startJump();
				} else if (this.canMove()) {
					this.preStartMove();
				} else {

					// Stop player.
					this.doneMove();

					// Tell other players we've stopped.
					this.emitUpdateMoveState(this.pos.x, this.pos.y, this.facing, this.moveState);
				}
			} else {

				// Stop player.
				this.doneMove();

				// Tell other players we've stopped.
				this.emitUpdateMoveState(this.pos.x, this.pos.y, this.facing, this.moveState);
			}
		},

		// Tries interacted with the faced tile.
		action: function() {

			// Get faced tile position.
			var position = this.getTilePos(this.pos.x, this.pos.y, this.facing, 1);

			// Get all signs.
			var signs = ig.game.getEntitiesByType(EntitySign);

			// Check that at least one sign exists.
			if (signs) {
				for (var i = 0; i < signs.length; i++) {

					// Check if the tile is located at the faced tile.
					if ((signs[i].pos.x == position.x) && (signs[i].pos.y == position.y)) {

						// Set chat bubble duration.
						var bubbleDuration = 3; // magic numbers are bad!
						// Spawn a chat bubble at the sign.
						ig.game.spawnEntity(EntityBubble, signs[i].pos.x, signs[i].pos.y, {

							// Pass in sign message to chat bubble.
							msg: signs[i].msg,

							// Entity to follow.
							follow: signs[i],

							// Life of chat bubble.
							lifespan: bubbleDuration
						});

						// Shouldn't be more than one interactable object per tile.
						return;
					}
				}
			}

			// Get all NPC's.
			var npcs = ig.game.getEntitiesByType(EntityNpc);

			// Check that at least one NPC exists.
			if (npcs) {
				for (var i = 0; i < npcs.length; i++) {

					// Check if the NPC is located at the faced tile.
					if ((npcs[i].pos.x == position.x) && (npcs[i].pos.y == position.y)) {

						// Set chat bubble duration.
						var bubbleDuration = 3; // magic numbers are bad!
						// Spawn a chat bubble at the NPC.
						ig.game.spawnEntity(EntityBubble, npcs[i].pos.x, npcs[i].pos.y, {

							// Pass in NPC message to chat bubble.
							msg: npcs[i].msg,

							// Entity to follow.
							follow: npcs[i],

							// Life of chat bubble.
							lifespan: bubbleDuration // magic numbers are bad!
						});

						// Delay NPC's movement.
						npcs[i].moveTimer.set(bubbleDuration + 1);

						// Get NPC's name entity.
						var nameEntity = ig.game.getEntityByName(npcs[i].name + "NameEntity");

						// Check if name entity was found.
						if (nameEntity != undefined) {
							// Hide name for duration of chat bubble.
							nameEntity.hideTimer.set(bubbleDuration);
						}

						// Shouldn't be more than one interactable object per tile.
						return;
					}
				}
			}
		},

		// Returns the exit entity if found at the faced tile, else returns false.
		facingExit: function() {
			// Get position of faced tile.
			var position = this.getTilePos(this.pos.x, this.pos.y, this.facing, 1);

			// Get all door entities.
			var doors = ig.game.getEntitiesByType(EntityExit);

			// Check that at least one door was found.
			if (doors) {
				for (var i = 0; i < doors.length; i++) {

					// Check that door location is the same as the faced tile.
					if (doors[i].pos.x == position.x && doors[i].pos.y == position.y) {

						// Found an exit entity at the faced tile.
						return doors[i];
					}
				}
			}

			// Found no exit at the faced tile.
			return false;
		},

		// Returns the exit entity if found at players location, else returns false.
		overExit: function() {
			// Get all exit entities.
			var exits = ig.game.getEntitiesByType(EntityExit);

			// Check that at least one was returned.
			if (exits) {
				for (var i = 0; i < exits.length; i++) {

					// Check that exit shares the same position as the player.
					if (exits[i].pos.x == this.pos.x && exits[i].pos.y == this.pos.y && exits[i].type != 'door') {

						// Found a matching exit entity.
						return exits[i];
					}
				}
			}

			// Found no matching entity.
			return false;
		},

		// Checks for faced and stood-on exits before each more and calls startMove if none are found.
		preStartMove: function() {

			// Check if player is over a "floor" style exit.
			var exit = this.overExit();

			// Check if players faced direction will trigger a zone change.
			if (exit && this.facing == exit.direction) {

				// Trigger a zone change.
				exit.trigger();

				// Do not trigger a regular move.
				return;
			}

			// Check if player is facing a "door" style exit.
			var exit = this.facingExit();

			if (exit) {

				// Make sure that faced exit is a door type.
				if (exit.type == 'door') {

					// Play the door opening animation.
					exit.startAnim();

					// 22 frame wait @ 60 frames per second = 22/60 = 0.36666..sec
					this.moveWhen = 336.7 + new Date().getTime();

					// Tell player to wait before moving through door.
					this.waitingToMove = true;

					// Tell player what exit to trigger after he moves.
					this.moveDoor = exit;

					// Do not trigger a regular move.
					return;
				} else // The exit must be a "floor" style exit.
				{

					// Check if floor exit arrow should be turned on.
					if (this.facing == exit.direction) {
						// Turn on blinking arrow animation.
						exit.startAnim();
					}
				}
			}

			// Start moving player.
			this.startMove();
		},

		// Adds initial delay before player movement so he can change direction without 
		// moving. Then starts move if possible, otherwise starts a slow-walk effect.
		movePressed: function() {

			// Reset the commit process if new direction is detected.
			if (this.moveCommitDirection != this.facing) {
				this.moveCommitPending = false;
				this.moveCommitWhen = 0;
			}

			// Start new commit process if one does not exist.
			if (!this.moveCommitPending) {
				this.moveCommitPending = true;
				this.moveCommitDirection = this.facing;

				// Check if the player has changed his direction.
				if (this.lastFacing == this.facing) {
					// Skip delay when already facing direction.
					var delay = 0;
				} else {
					// Add slight delay before commiting to moves.
					var delay = 80;
				}

				// Set the time when the move will be committed.
				this.moveCommitWhen = new Date().getTime() + delay;
			}

			// Check if player has committed to trying to move.
			if (new Date().getTime() - this.moveCommitWhen >= 0) {

				// Reset commitment process for next time.
				this.moveCommitPending = false;
				this.moveCommitWhen = 0;

				// Check if play can jump.
				if (this.canJump()) {

					// Jump.
					this.startJump();

				} else
				// Chec if player can move regularly.
				if (this.canMove()) {

					// Being move.
					this.preStartMove();
				} else {

					// Debug message.
					console.debug("Trying to set slow walk...");

					// Cannot move, but trying, so slow-walk instead.
					switch (this.facing) {
					case 'left':
						this.currentAnim = this.anims.slowLeft;
						break;
					case 'right':
						this.currentAnim = this.anims.slowRight;
						break;
					case 'up':
						this.currentAnim = this.anims.slowUp;
						break;
					case 'down':
						this.currentAnim = this.anims.slowDown;
						break;
					}
				}
			}

			// Player is not yet committed. 
			else {
				// Check if player has changed faced directions.
				if (this.facing != this.lastFacing) {

					// Tell other players that we changed our faced direction.
					this.emitUpdateMoveState(this.pos.x, this.pos.y, this.facing, this.moveState);

					// So we don't send the same update twice.
					this.lastFacing = this.facing;

					// Animate the change.
					this.moveAnimStart(false);

					// Check if we're standing on an exit.
					var exit = this.overExit(this);

					// Check that an exit was found.
					if (exit) {

						// Check if arrow animation needs to be turned on.
						if (this.facing == exit.direction) {
							// Turn on arrows.
							exit.startAnim();
						} else {
							// Turn off arrows if facing wrong direction.
							exit.stopAnim();
						}
					}
				}
			}
		},

		// Does nothing until wait is over, then starts move.
		moveWait: function() {
			if (this.waitingToMove) {

				// Check if waiting is over.
				if (new Date().getTime() - this.moveWhen >= 0) {

					// Start move.
					this.startMove();

					// Allow move to cycle.
					this.waitingToMove = false;
				}
			}
		},

		// Stops all exit entity animations.
		turnOffExitAnimations: function() {
			// Get all exit entities.
			var exits = ig.game.getEntitiesByType(EntityExit);

			// Make sure at least one exists.
			if (exits) {

				// Loop through all entities.
				for (var i = 0; i < exits.length; i++) {

					// Stop animation.
					exits[i].stopAnim();
				}
			}
		},

		// Returns true if move key for direction is down, else returns false.
		moveKeyDown: function(facing) {
			switch (facing) {
			case 'left':
				return (ig.input.state('left') && !ig.input.state('right'))
				break;
			case 'right':
				return (ig.input.state('right') && !ig.input.state('left'))
				break;
			case 'up':
				return (ig.input.state('up') && !ig.input.state('down'))
				break;
			case 'down':
				return (ig.input.state('down') && !ig.input.state('up'))
				break;
			}

			// Key is not down.
			return false;
		},

		// Handles exactly how a move takes place (speed, effects, etc.)
		startMove: function() {

			// Water
			if (this.canSwim()) {

				// Set movement speed on water.
				this.setMoveState('swim');
			}

			// Land
			else {

				// Determine movement speed on land.
				if (this.jumping) this.setMoveState('jump');
				else if (this.onBike) this.setMoveState('bike');
				else if (ig.input.state('run')) this.setMoveState('run');
				else this.setMoveState('walk');
			}

			// Call parent.
			this.parent();

			// Check if the players state is different than it was.
			if (this.lastFacing != this.facing || this.lastState != this.moveState) {

				// Tell other players about this move.
				this.emitUpdateMoveState(this.pos.x, this.pos.y, this.facing, this.moveState);

				// To prevent sending the same update twice.
				this.lastState = this.moveState;
			}

			// Update last faced direction.
			this.lastFacing = this.facing;
		},

		init: function(x, y, settings) {
			this.parent(x, y, settings);

			// Tell the world all about this player.
			this.netInit();
		},

		update: function() {
			this.parent();

			// Check for bike toggle.
			if (ig.input.pressed('bike') && !this.swimming) {

				// Toggle bike.
				this.onBike = !this.onBike;

				// Update state.
				this.setIdle();

				// Tell the world.
				this.emitUpdateMoveState(this.pos.x, this.pos.y, this.facing, this.moveState);
			}

			// Check for actions, like reading signs, or talking to NPC's.
			if (ig.input.pressed('action') && !this.moving) {

				// Action key was pressed.
				this.action(this);
			}

			// Player just entered a door but has not yet changed zones.
			if (this.moveDoor && !this.waitingToMove && !this.moving) {

				// Change zones.
				this.moveDoor.trigger();

			}
			// Handle movements.
			else {

				// Check if waiting to walk through a door.
				if (this.waitingToMove) {

					// Debug message.
					console.debug("Waiting to move...");

					// Waiting to move.
					this.moveWait();

				}
				// Check if currently jumping or moving.
				else if (this.jumping || this.moving) {

					// Finish the current move.
					this.finishMove();

				}
				// Check if trying to start a new move.
				else if (this.moveKeyDown('left')) {
					this.facing = 'left';
					this.movePressed();
				} else if (this.moveKeyDown('right')) {
					this.facing = 'right';
					this.movePressed();
				} else if (this.moveKeyDown('up')) {
					this.facing = 'up';
					this.movePressed();
				} else if (this.moveKeyDown('down')) {
					this.facing = 'down';
					this.movePressed();
				}
				// Player is not trying to move.
				else {

					// Set animation.
					this.moveAnimStop();

					// Keep slow-walk animations rewound.
					this.anims.slowLeft.rewind();
					this.anims.slowRight.rewind();
					this.anims.slowUp.rewind();
					this.anims.slowDown.rewind();
				}
			}
		}


	});
})