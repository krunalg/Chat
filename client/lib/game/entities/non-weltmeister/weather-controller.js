ig.module('game.entities.non-weltmeister.weather-controller')

.requires('impact.entity')

.defines(function() {

	EntityWeatherController = ig.Entity.extend({

		init: function(x, y, settings) {
			this.parent(x, y, settings);
		},

		update: function() {

			// Spawn a raindrop.
			ig.game.spawnEntity(EntityRaindrop, this.pos.x, this.pos.y, {});

			// Call parent.
			this.parent();
		}

	});
});