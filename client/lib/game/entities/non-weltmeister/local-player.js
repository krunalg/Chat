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
			socket.emit('hereIAm', this.pos.x, this.pos.y, this.facing, ig.game.mapName, this.skin);
		},

		// Tell server that the player just jumped.
		emitJump: function(x, y, direction) {
			socket.emit('receiveJump', x, y, direction);
		},

		// Tell server that the player just changes his movement state.
		emitUpdateMoveState: function(x, y, direction, state) {
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
					this.isMove = false; // will use isJump instead
					this.startJump();
				} else if (this.canMove()) {
					this.preStartMove();
				} else {
					// Stop player.
					this.stopMoving();
				}
			} else {
				// Stop player.
				this.stopMoving();
			}
		},

		// Sets player to idle state and notifies the server.
		stopMoving: function() {
			// Player is not moving.
			this.isMove = false;

			// Player is not jumping.
			this.isJump = false;

			// Set move state.
			this.moveState = this.lastState = 'idle';

			// Stop the movement animation.
			this.moveAnimStop();

			// Tell other players we've stopped.
			this.emitUpdateMoveState(this.pos.x, this.pos.y, this.facing, this.moveState);
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
				if (this.lastFacing == this.facing) 
				{
					// Skip delay when already facing direction.
					var delay = 0;
				}
				else 
				{
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

				if (this.canJump()) {
					this.startJump();
				} else if (this.canMove()) {
					this.preStartMove();
				} else {
					console.debug("Trying to set slow walk...");
					// can't move, set slow walk animation
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
			} else // player has not yet committed to (trying to) move
			{
				// if player changed faced direction
				if (this.facing != this.lastFacing) {

					// Tell other players that we changed our faced direction.
					this.emitUpdateMoveState(this.pos.x, this.pos.y, this.facing, this.moveState);
					this.lastFacing = this.facing; // so we don't inform them again
					this.moveAnimStart(false); // step-animate the change
					// check if we are on an exit that needs animating
					var exit = this.overExit(this);
					if (exit) {
						if (this.facing == exit.direction) exit.startAnim();
						else exit.stopAnim();
					}
				}
			}
		},

		moveWait: function() {
			if (this.waitingToMove) {
				if (new Date().getTime() - this.moveWhen >= 0) {
					this.startMove();
					this.waitingToMove = false;
				}
			}
		},

		turnOffExitAnimations: function()
		// turn off all exit animations
		{
			var exits = ig.game.getEntitiesByType(EntityExit);
			if (exits) {
				for (var i = 0; i < exits.length; i++) {
					exits[i].stopAnim();
				}
			}
		},

		moveKeyDown: function(facing)
		// returns true if the supplied param
		// facing key is currently pressed
		{
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
			return false;
		},

		startMove: function() {

			if (this.canSwim()) // Water
			{
				// Set movement speed on water.
				this.moveState = 'swim';
				this.speed = this.swimSpeed;

				if (!this.swimming) {
					// Reset hop-on-to-surf-entity animation.
					this.anims['swim' + ig.game.capitaliseFirstLetter(this.facing)].rewind();

					// Spawn a surf entity.
					this.spawnSurf();

					// Play is no longer on land.
					this.swimming = true;
				}
			} else // Land
			{
				// It's difficult to swim on land.
				this.swimming = false;

				// Determine movement speed on land.
				if (ig.input.state('run')) this.setMoveState('run');
				else this.setMoveState('walk');

				// Spawn new grass entity if needed.
				var newGrass = this.trySpawningGrass();
				if (newGrass) newGrass.play();

				// Remove old grass entity if leaving one.
				var oldGrass = this.inGrass();
				if (oldGrass) oldGrass.markForDeath();
			}

			this.isMove = true;
			this.setMoveDestination();

			this.moveAnimStart(true);

			// send movement update only when change occurs
			if (this.lastFacing != this.facing || this.lastState != this.moveState) {
				this.emitUpdateMoveState(this.pos.x, this.pos.y, this.facing, this.moveState);
				this.lastState = this.moveState;
			}

			this.lastFacing = this.facing;
		},

		startJump: function() {
			// determine speed
			this.moveState = 'jump';
			this.speed = this.jumpSpeed;

			this.isJump = true;
			this.jumpStart = new ig.Timer();
			this.spawnShadow();
			this.setMoveDestination();

			this.moveAnimStart(true);
			this.emitJump(this.pos.x, this.pos.y, this.facing);
			this.lastFacing = this.facing;
		},

		init: function(x, y, settings) {
			this.parent(x, y, settings);

			// initiate network
			this.netInit();
		},

		update: function() {
			this.parent();

			// action (like reading a sign or talking to npc)
			if (ig.input.pressed('action') && !this.isMove) {
				this.action(this);
			}

			// handle zoning
			if (this.moveDoor && !this.waitingToMove && !this.isMove) {
				// we just entered a door, so zone
				this.moveDoor.trigger();
			} else {
				/////////////////////
				// Handle Movement //
				/////////////////////
				if (this.waitingToMove) {
					// about to move
					console.debug("Waiting to move...");
					this.moveWait();
				} else if (this.isJump || this.isMove) {
					// a move or jump has already been started
					this.finishMove();
				} else if (ig.input.state('left') && !ig.input.state('right')) {
					// if player is trying to move left
					this.facing = 'left';
					this.movePressed();
				} else if (ig.input.state('right') && !ig.input.state('left')) {
					// if player is trying to move right
					this.facing = 'right';
					this.movePressed();
				} else if (ig.input.state('up') && !ig.input.state('down')) {
					// if player is trying to move up
					this.facing = 'up';
					this.movePressed();
				} else if (ig.input.state('down') && !ig.input.state('up')) {
					// if player is trying to move down
					this.facing = 'down';
					this.movePressed();
				} else {

					// if player not trying to move, set to idle
					this.moveAnimStop();
					// keep all slow-walk animations reset
					this.anims.slowLeft.rewind();
					this.anims.slowRight.rewind();
					this.anims.slowUp.rewind();
					this.anims.slowDown.rewind();
				}
			}
		}

	});

})