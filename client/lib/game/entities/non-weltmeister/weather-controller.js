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

			// Random x.
			var x = ig.game.screen.x + Math.floor(Math.random() * (ig.system.width + ((1 / 3) * ig.system.height) - 30) ) + 30;
			//x = Math.floor(x/32) * 32;

			// Random y.
			var y = ig.game.screen.y - Math.floor(Math.random() * 32) + 16;
			//y = Math.floor(y/32) * 32;

			// Spawn a raindrop.
			ig.game.spawnEntity(EntityRaindrop, x, y, {});

			// Call parent.
			this.parent();
		}

	});
});