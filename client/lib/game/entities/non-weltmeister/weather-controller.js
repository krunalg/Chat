ig.module('game.entities.non-weltmeister.weather-controller')

.requires('impact.entity')

.defines(function() {

	EntityWeatherController = ig.Entity.extend({

		// Entities per second.
		spawnRate: 5,

		init: function(x, y, settings) {
			this.parent(x, y, settings);
		},

		update: function() {

			// Random distance from left of screen.
			var x = ig.game.screen.x + Math.floor(Math.random() * (ig.system.width + ((1 / 3) * ig.system.height) - 30) ) + 30;

			// Random distance above top of screen.
			var y = ig.game.screen.y - Math.floor(Math.random() * 16) - 32;

			// Spawn a raindrop.
			ig.game.spawnEntity(EntityRaindrop, x, y, {});

			// Call parent.
			this.parent();
		}

	});
});