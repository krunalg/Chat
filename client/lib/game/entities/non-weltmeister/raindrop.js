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

			this.vel.x = -13 * 20;
			this.vel.y = 26 * 20;
		},

		handleMovementTrace: function(res) {

			// Do not collide with collisionMap.
			return;
		},

		update: function() {

			// Update animations.
			if (this.currentAnim != null) this.currentAnim.update();

			// Check if animation has finished.
			if (this.currentAnim.loopCount >= 1) {
				// Free up resources.
				this.kill();
			}
		}

	});
});