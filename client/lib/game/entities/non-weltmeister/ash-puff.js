ig.module('game.entities.non-weltmeister.ash-puff')

.requires('impact.entity')

.defines(function() {

	EntityAshPuff = ig.Entity.extend({

		size: {
			x: 16,
			y: 16
		},

		// Load image resource.
		animSheet: new ig.AnimationSheet('media/rs.ash-puff.png', 16, 16),

		init: function(x, y, settings) {
			this.parent(x, y, settings);

			// Define animation sequence.
			this.addAnim('puff', (2 / 60), [0, 1]);

			// Set current animation.
			this.currentAnim = this.anims.puff;

			this.zIndex = this.zPriority + this.pos.y;
		}

	});
});
