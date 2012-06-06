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

		animSheet: new ig.AnimationSheet('media/rs.surf.png', 32, 32),

		init: function(x, y, settings) {
			this.parent(x, y, settings);

			// Add each possible faced state.
			this.addAnim('up', 1, [0], true);
			this.addAnim('down', 1, [2], true);
			this.addAnim('left', 1, [1], true);
			this.addAnim('right', 1, [1], true);

			// Flip the image for facing right.
			this.anims.right.flip.x = true;

			// Set current animation.
			this.resetAnimation();
		},

		resetAnimation: function() {
			switch (this.facing) {
			case 'left':
			case 'right':
			case 'up':
			case 'down':
				this.currentAnim = this.anims[this.facing]
				break;
			default:
				throw "Error: tried giving surf entity illegal direction to face.";
				break;
			}
		},

		draw: function() {
			
			// Check that we have entity to follow.
			if (this.follow) {

				// Kill entity when no long swimming.
				if (!this.follow.swimming) this.kill();

				// Update direction according to player.
				if (this.facing != this.follow.facing) {
					this.facing = this.follow.facing;
					this.resetAnimation();
				}

				// Copy coordinates of player.
				this.pos = this.follow.pos;

			} 
			
			// Catch error.
			else throw "Error: EntitySurf was created without a player to follow.";

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