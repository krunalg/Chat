ig.module('game.entities.non-weltmeister.surf')

.requires('impact.entity')

.defines(function() {

	EntitySurf = ig.Entity.extend({

		size: {
			x: 16,
			y: 16
		},
		offset: {
			x: 8,
			y: 8
		},

		// Entity to follow.
		follow: null,

		init: function(x, y, settings) {
			this.parent(x, y, settings);
		},

		draw: function() {
			
			// Check that we have entity to follow.
			if (this.follow) {

				// Copy coordinates of player.
				this.pos = this.follow.pos;

				// Copy animation of player.
				this.currentAnim = this.follow.currentAnim;

			}
			
			// Remove reflection if the player does not exist.
			else {

				// Debug message.
				console.debug("Reflection entity exists but player does not and will now suicide.");

				// Kill entity.
				this.kill();
			}

			// Parent call.
			this.parent();
		},

		update: function() {
			
			// Kill this entity if player no longer exists.
			if(this.follow._killed) this.kill();

			// Parent call.
			this.parent();
		}


	});
});