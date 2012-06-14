ig.module('game.entities.non-weltmeister.weather-controller')

.requires('impact.entity')

.defines(function() {

	EntityWeatherController = ig.Entity.extend({

		// Max rain entities on screen at once.
		maxRain: 16,

		init: function(x, y, settings) {
			this.parent(x, y, settings);
		},

		update: function() {

			// Random distance from left of screen.
			var x = ig.game.screen.x + Math.floor(Math.random() * (ig.system.width + ((1 / 3) * ig.system.height) - 30)) + 30;

			// Random distance above top of screen.
			var y = ig.game.screen.y - Math.floor(Math.random() * 16) - 32;

			// Never exceed maximum.
			if (ig.game.getEntitiesByType(EntityRaindrop).length < this.maxRain) {

				// Spawn a raindrop.
				ig.game.spawnEntity(EntityRaindrop, x, y, {});
			}

			// Call parent.
			this.parent();
		}

	});
});