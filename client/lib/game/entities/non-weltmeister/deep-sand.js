ig.module('game.entities.non-weltmeister.deep-sand')

.requires('game.entities.non-weltmeister.splash')

.defines(function() {

	EntityDeepSand = EntitySplash.extend({

		offset: {
			x: 0,
			y: -10
		},

		// Load image resource.
		animSheet: new ig.AnimationSheet('media/rs.deep-sand.png', 16, 8),

		init: function(x, y, settings) {
			this.parent(x, y, settings);

			// Define animation sequence.
			this.addAnim('sand', (1 / 60), [1, 1, 1, 1, 2, 2, 2, 2, 0, 0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 2, 0], true);

			// Set current animation.
			this.currentAnim = this.anims.sand;

			// Start at the very last frame.
			this.currentAnim.gotoFrame(this.currentAnim.sequence.length-1);
		},


	});
});