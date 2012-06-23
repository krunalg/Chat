ig.module('game.entities.non-weltmeister.tall-grass')

.requires('game.entities.grass')

.defines(function() {

	EntityTallGrass = EntityGrass.extend({

		_wmIgnore: true,

		// Load image resource.
		animSheet: new ig.AnimationSheet('media/rs.tall-grass.png', 16, 16),

		init: function(x, y, settings) {
			this.parent(x, y, settings);

			// Create animation.
			this.addAnim('rustle', (1 / 60), [0, 0, 0, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 2, 2, 2, 2, 3, 3, 3, 3, 2], true);
			this.addAnim('static', 1, [2], true);

			this.currentAnim = this.anims['static'];
		}

	});
});