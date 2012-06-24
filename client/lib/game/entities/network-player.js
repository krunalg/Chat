ig.module(

'game.entities.network-player')

.requires(

'game.entities.player').defines(function() {

	EntityNetworkPlayer = EntityPlayer.extend({

		_wmIgnore: true,

		// Priority relative to other entities.
		zPriority: 1,

		init: function(x, y, settings) {
			this.parent(x, y, settings);

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
				
				if(state=='walk'||state=='run') 
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

				if(state=='jump') 	player.startJump(); 
				else 				player.startMove();
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
		}


	});
})