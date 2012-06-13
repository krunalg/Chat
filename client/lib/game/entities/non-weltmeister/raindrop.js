ig.module('game.entities.non-weltmeister.raindrop')

.requires('impact.entity')

.defines(function() {

	EntityRaindrop = ig.Entity.extend({

		size: {
			x: 16,
			y: 16
		},

		// Load image resource.
		animSheet: new ig.AnimationSheet('media/rs.raindrop.png', 16, 32),

		init: function(x, y, settings) {
			this.parent(x, y, settings);

			// Set up animation.
			this.addAnim('rain', 1, [0,0,0,1,2,3], true);

			// Set current animation.
			this.currentAnim = this.anims.rain;

			// Set velocity.
			this.maxVel.x = this.vel.x = -13 * 30;
			this.maxVel.y = this.vel.y = 26 * 30;
		},

		handleMovementTrace: function(res) {
			// This completely ignores the trace result (res) and always
		    // moves the entity according to its velocity
		    this.pos.x += this.vel.x * ig.system.tick;
		    this.pos.y += this.vel.y * ig.system.tick;
		},

		update: function() {

			// Check if animation has finished.
			if (this.currentAnim.loopCount >= 1) {
				// Free up resources.
				this.kill();
			}

			// Call parent.
			this.parent();
		}

	});
});