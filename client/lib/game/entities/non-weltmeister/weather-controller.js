ig.module('game.entities.non-weltmeister.weather-controller')

.requires('impact.entity')

.defines(function() {

	EntityWeatherController = ig.Entity.extend({

		// Max rain entities on screen at once.
		maxRain: 16,

		// Max sand-cloud entities on screen at once.
		maxSand: 8,

		// Type of weather effect.
		weather: null,

		init: function(x, y, settings) {
			this.parent(x, y, settings);

			// Start sandstorm.
			if (this.weather=='sandstorm') {

				// Start sand-screen.
				this.sandscreen = ig.game.spawnEntity(EntitySandScreen, 0, 0, {});
			}
		},

		update: function() {

			// Rain
			if (this.weather=='rain') {

				// Random distance from left of screen.
				var x = ig.game.screen.x + Math.floor(Math.random() * (ig.system.width + ((1 / 3) * ig.system.height) - 30)) + 30;

				// Random distance above top of screen.
				var y = ig.game.screen.y - Math.floor(Math.random() * 16) - 32;

				// Never exceed maximum.
				if (ig.game.getEntitiesByType(EntityRaindrop).length < this.maxRain) {

					// Spawn a raindrop.
					ig.game.spawnEntity(EntityRaindrop, x, y, {});
				}
			}

			// Sandstorm
			else if (this.weather=='sandstorm') {

				// Random distance from left of screen.
				var x = ig.game.screen.x + Math.floor(Math.random() * (ig.system.width - 32));

				// Start below screen.
				var y = ig.game.screen.y + ig.system.height;

				// Never exceed maximum.
				if (ig.game.getEntitiesByType(EntitySandCloud).length < this.maxSand) {

					// Spawn a raindrop.
					ig.game.spawnEntity(EntitySandCloud, x, y, {});
				}
			}
				

			// Call parent.
			this.parent();
		}

	});
});