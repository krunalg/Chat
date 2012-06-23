ig.module('game.entities.non-weltmeister.jump')

.requires('impact.entity')

.defines(function() {

	EntityJump = ig.Entity.extend({

		_wmIgnore: true,

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

			// Define animation sequence.
			this.addAnim('jump', (8 / 60), [0, 0, 0, 0, 1, 2, 3, 3], true);

			// Set current animation.
			this.currentAnim = this.anims.jump;

			// Get map tilesize.
			var tilesize = ig.game.collisionMap.tilesize;

			// Set movement speed and destination based on direction.
			switch (this.direction) {
			case 'left':

				// Set movement speed.
				this.vel.x = -this.speed;

				// Set destination.
				this.destinationX = this.pos.x - tilesize * 2;

				break;
			case 'right':

				// Set movement speed.
				this.vel.x = +this.speed;

				// Set destination.
				this.destinationX = this.pos.x + tilesize * 2;
				break;
			case 'up':

				// Set movement speed.
				this.vel.y = -this.speed;

				// Set destination.
				this.destinationY = this.pos.y - tilesize * 2;
				break;
			case 'down':

				// Set movement speed.
				this.vel.y = +this.speed;

				// Set destination.
				this.destinationY = this.pos.y + tilesize * 2;
				break;
			}
		},

		// Stop the entity and align to grid.
		stopMoving: function(axis)
		{
			// Stop moving.
			this.vel[axis] = 0;

			// Align to grid.
			this.pos[axis] = this['destination' + axis.toUpperCase()];

			// No need to stop again.
			this.arrived = true;
		},

		update: function() {

			
			if (!this.arrived) {

				// Stop moving if reached destination.
				switch (this.direction) {
				case 'left':
					if (this.pos.x <= this.destinationX) this.stopMoving('x');
					break;

				case 'right':
					if (this.pos.x >= this.destinationX) this.stopMoving('x');
					break;

				case 'up':
					if (this.pos.y <= this.destinationY) this.stopMoving('y');
					break;

				case 'down':
					if (this.pos.y >= this.destinationY) this.stopMoving('y');
					break;
				}
			}

			// Show the first frame of dust as being above the player.
			if (this.currentAnim.frame == 4) this.zIndex = this.pos.y + 3;

			// Then place the rest of the animation under the player.
			if (this.currentAnim.frame == 5) this.zIndex = this.pos.y + 0;

			// Kill the entity on the last frame.
			if (this.currentAnim.frame == this.currentAnim.sequence.length - 1) this.kill();

			// Call parent.
			this.parent();
		}

	});

});
