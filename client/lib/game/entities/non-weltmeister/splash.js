ig.module('game.entities.non-weltmeister.splash')

.requires('impact.entity')

.defines(function() {

	EntitySplash = ig.Entity.extend({

		size: {
			x: 16,
			y: 16
		},

		// Reference of entity of which to follow.
		follow: null,

		// Initialize
		init: function(x, y, settings) {
			this.parent(x, y, settings);
		},

		update: function() {
			this.parent();
		}

	});
});
