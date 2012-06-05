ig.module('game.entities.non-weltmeister.jump')

.requires('impact.entity')

.defines(function() {

	EntityJump = ig.Entity.extend({

		// Should be the same as player walk speed.
		speed: 69,

		size: {
			x: 16,
			y: 16
		},

		offset: {
			x: 0,
			y: -8
		},

		// Load image resource.
		animSheet: new ig.AnimationSheet('media/rs.jump.png', 16, 8),

		// Direction to move, supplied when spawned.
		direction: null,

		// will be true when no longer moving and aligned
		arrived: false,

		init: function(x, y, settings) {
			this.parent(x, y, settings);

			this.zIndex = 0,

			this.addAnim('jump', (8 / 60), [0, 0, 0, 0, 1, 2, 3, 3], true);
			this.currentAnim = this.anims.jump;

			this.destinationX = this.pos.x; // destination x
			this.destinationY = this.pos.y; // and y
			var tilesize = ig.game.collisionMap.tilesize;

			switch (this.direction) {
			case 'left':
				this.vel.x = -this.speed;
				this.destinationX -= tilesize * 2;
				break;
			case 'right':
				this.vel.x = +this.speed;
				this.destinationX += tilesize * 2;
				break;
			case 'up':
				this.vel.y = -this.speed;
				this.destinationY -= tilesize * 2;
				break;
			case 'down':
				this.vel.y = +this.speed;
				this.destinationY += tilesize * 2;
				break;
			}
		},

		update: function() {
			
			// Try to stop moving.
			if (!this.arrived) {
				
				switch (this.direction) {
				case 'left':
					if (this.pos.x <= this.destinationX) {
						
						// Stop moving.
						this.vel.x = 0;

						// Align to grid.
						this.pos.x = this.destinationX;

						// No need to stop again.
						this.arrived = true;
					}
					break;
				case 'right':
					if (this.pos.x >= this.destinationX) {
						
						// Stop moving.
						this.vel.x = 0;

						// Align to grid.
						this.pos.x = this.destinationX;

						// No need to stop again.
						this.arrived = true;
					}
					break;
				case 'up':
					if (this.pos.y <= this.destinationY) {
						
						// Stop moving.
						this.vel.y = 0;

						// Align to grid.
						this.pos.y = this.destinationY;

						// No need to stop again.
						this.arrived = true;
					}
					break;
				case 'down':
					if (this.pos.y >= this.destinationY) {
						
						// Stop moving.
						this.vel.y = 0;

						// Align to grid.
						this.pos.y = this.destinationY;

						// No need to stop again.
						this.arrived = true;
					}
					break;
				}
			}

			// Show the first frame of dust as being above the player.
			if (this.currentAnim.frame == 4) this.zIndex = this.pos.y + 3;

			// Then place the rest of the animation under the player.
			if (this.currentAnim.frame == 5) this.zIndex = this.pos.y + 0;

			// Kill the entity on the last frame.
			if (this.currentAnim.frame == this.currentAnim.sequence.length - 1) this.kill();

			this.parent();
		}
	});

});
