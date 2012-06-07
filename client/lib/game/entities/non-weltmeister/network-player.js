ig.module(

'game.entities.non-weltmeister.network-player')

.requires(

'game.entities.non-weltmeister.player').defines(function() {

	EntityNetworkPlayer = EntityPlayer.extend({

		// Priority relative to other entities.
		zPriority: 1,

		init: function(x, y, settings) {
			this.parent(x, y, settings);

			// Set the players skin.
			this.reskin(this.skin);

			// Needed for passing a persistent reference of self into functions.
			var player = this;

			// Spawn a NameEntity to follow this player.
			ig.game.spawnEntity(
			EntityName, this.pos.x, this.pos.y, {
				name: this.name + "NameEntity",
				follow: player,
				color: 'blue'
			});

			// Some player changed his movement state.
			socket.on('moveUpdateOtherPlayer-' + this.name, function(x, y, direction, state) {
				player.vel.x = 0;
				player.vel.y = 0;
				player.pos.x = x;
				player.pos.y = y;
				player.facing = direction;
				player.moveState = state;
				player.startMove();
			});

			// A player jumped a ledge.
			socket.on('otherPlayerJump-' + this.name, function(x, y, direction) {
				player.vel.x = 0;
				player.vel.y = 0;
				player.pos.x = x;
				player.pos.y = y;
				player.facing = direction;
				player.moveState = 'jump';
				player.startJump();
			});

			// A player set his skin.
			socket.on('reskinOtherPlayer-' + this.name, function(skin) {
				player.skin = skin;
				player.reskin();
			});

			// A player disconnected or left the area.
			socket.on('dropPlayer-' + this.name, function() {
				ig.game.events.push(player.name + " left the area.");
				player.kill();
			});

		},

		// Determine if player should continue moving or stop.
		continueOrStop: function() {
			// Check if player should stop.
			if (this.moveState == 'idle') {

				// Not moving.
				this.isMove = false;

				// Not jumping.
				this.isJump = false;

				// Set idle animation.
				this.moveAnimStop();

			}
			// Player has not stopped.
			else {
				// Check if move is possible.
				if (this.canMove()) {

					// Move player.
					this.startMove();
				}
			}
		},

		// Handles exactly how a move takes place (speed, effects, etc.)
		startMove: function() {
			if (this.moveState == 'idle') this.isMove = false;
			else {
				// determine speed
				if (this.moveState == 'run') this.speed = this.runSpeed;
				else if (this.moveState == 'walk') this.speed = this.walkSpeed;

				// Spawn new grass entity if needed.
				var newGrass = this.trySpawningGrass();
				if (newGrass) newGrass.play();

				// Remove old grass entity if leaving one.
				var oldGrass = this.inGrass();
				if (oldGrass) oldGrass.markForDeath();

				// Player is moving.
				this.isMove = true;

				// Set destination.
				this.setMoveDestination();

				// Start animations.
				this.moveAnimStart(true);
			}
		},

		// Initiate a jump.
		startJump: function() {
			
			// Determine movement speed.
			this.setMoveState('jump');
			
			// Player is jumping.
			this.isJump = true;

			// Used for animating player entity.
			this.jumpStart = new ig.Timer();

			// Spawn shadow under the player.
			this.spawnShadow();

			// Calculate player destination.
			this.setMoveDestination();

			// Change animation from idle.
			this.moveAnimStart(true);
		},

		update: function() {
			this.parent();

			// movement
			if (this.isJump || this.isMove) {
				this.finishMove();
			} else {
				// keep animation consistent with this.facing
				this.moveAnimStop();
			}
		}


	});
})