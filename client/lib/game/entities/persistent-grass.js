ig.module('game.entities.non-weltmeister.persistent-grass')

.requires('game.entities.grass')

.defines(function() {

	EntityPersistentGrass = EntityGrass.extend({

		_wmIgnore: true,

		// Below players.
		zPriority: 0,

		init: function(x, y, settings) {
			
			this.parent(x, y, settings);

			// The number 6 does not exist in the sprite sheet and is used as a 'blank'.
			this.addAnim('static', (4/60), [6, 5], true);

			this.currentAnim = this.anims['static'];
		},

		// Overwrite the update function so entity does not despawn itself.
		update: function() {

			// Update animations.
			if (this.currentAnim != null) this.currentAnim.update();
		}

	});
});