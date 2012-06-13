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
				player.vel.x = player.vel.y = 0;
				player.pos.x = x;
				player.pos.y = y;
				player.facing = direction;
				player.setMoveState(state);
				
				if(state=='bike') 
				{
					player.onBike = true; 
					player.swimming = false;
					player.jumping = false;
				}
				
				if(state=='walk'||'run') 
				{
					player.onBike = false;
					player.swimming = false;
					player.jumping = false;
				}
				
				if(state=='jump') 
				{
					// => Can jump on/off of bike.
					player.jumping = true;
					player.swimming = false;
				}
				
				if(state=='swim') 
				{
					player.swimming = true;
					player.jumping = false;
					player.onBike = false;
				}

				player.startMove();
			});

			// A player jumped a ledge.
			socket.on('otherPlayerJump-' + this.name, function(x, y, direction) {
				player.vel.x = player.vel.y = 0;
				player.pos.x = x;
				player.pos.y = y;
				player.facing = direction;
				player.setMoveState('jump');
				player.startJump();
			});

			// A player set his skin.
			socket.on('reskinOtherPlayer-' + this.name, function(skin) {
				player.skin = skin;
				player.reskin();
			});

			// A player disconnected or left the area.
			socket.on('dropPlayer-' + this.name, function() {
				
				// Prevent multiple drop announcements.
				if(!player._killed)
				{
					// Write event to screen.
					ig.game.events.push(player.name + " left the area.");

					// Write to chat log.
					ig.game.chatLog.push('<div class="info">[' + ig.game.chatNameHTML(player.name) + '] left the area.</div>');

					// Free resources.
					player.kill();
				}
			});

		},

		// Determine if player should continue moving or stop.
		continueOrStop: function() {
			// Check if player should stop.
			if (this.moveState == 'idle') {

				// Not moving.
				this.moving = false;

				// Not jumping.
				this.jumping = false;

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
			if (this.moveState == 'idle') this.doneMove();
			else {

				// Spawn new grass entity if needed.
				var newGrass = this.trySpawningGrass();
				if (newGrass) newGrass.play();

				// Remove old grass entity if leaving one.
				var oldGrass = this.inGrass();
				if (oldGrass) oldGrass.markForDeath();

				// Player is moving.
				this.moving = true;

				// Set destination.
				this.setMoveDestination();

				// Start animations.
				this.moveAnimStart(true);
			}
		},

		update: function() {
			this.parent();

			// Check if player is moving.
			if (this.jumping || this.moving) {

				// Complete the started move.
				this.finishMove();

			} else {

				// Set idle animation.
				this.moveAnimStop();
			}
		}


	});
})