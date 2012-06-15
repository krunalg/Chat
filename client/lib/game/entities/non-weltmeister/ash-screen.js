ig.module('game.entities.non-weltmeister.ash-screen')

.requires('game.entities.non-weltmeister.screen')

.defines(function() {

	EntityAshScreen = EntityScreen.extend({

		vel: {
			
			x: 0,

			// Move 1 pixel per 6 frames at 60 FPS.
			y: 10
		}

		// Load image resource.
		animSheet: new ig.AnimationSheet('media/rs.ash-screen.png', 64, 64),

		init: function(x, y, settings) {
			this.parent(x, y, settings);

			// Set up animation.
			this.addAnim('shift', 1, [0, 1]);

			// Set current animation.
			this.currentAnim = this.anims['shift'];
		}


	});
});