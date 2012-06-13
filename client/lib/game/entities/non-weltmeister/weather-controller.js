ig.module('game.entities.non-weltmeister.weather-controller')

.requires('impact.entity')

.defines(function() {

	EntityWeatherController = ig.Entity.extend({

		init: function(x, y, settings) {
			this.parent(x, y, settings);
		},

		update: function() {

			// Call parent.
			this.parent();
		}

	});
});