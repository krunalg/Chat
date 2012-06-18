ig.module('game.entities.non-weltmeister.persistent-grass')

.requires('game.entities.grass')

.defines(function() {

	EntityPersistentGrass = EntityGrass.extend({

		// Below players.
		zPriority: 0,

		init: function(x, y, settings) {
			this.parent(x, y, settings);

			// Create animation.
			this.addAnim('static', 1, [5], true);

			this.currentAnim = this.anims['static'];
		},

		// Overwrite the update function so entity does not despawn itself.
		update: function() {}

	});
});