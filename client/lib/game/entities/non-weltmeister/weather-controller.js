ig.module('game.entities.non-weltmeister.weather-controller')

.requires('impact.entity')

.defines(function() {

	EntityWeatherController = ig.Entity.extend({


		// How many sand clouds to spawn per second.
		sandRate: 2,

		// How many raindrops to spawn per second.
		rainRate: 100,

		// Used to accomodate rate changes.
		rate: 0,

		// Timer for spawning entities.
		timer: null,

		// Used to prevent spawning too quickly.
		lastSpawned: -1,

		// Type of weather effect.
		weather: null,

		init: function(x, y, settings) {
			this.parent(x, y, settings);

			// Start spawn timer.
			this.timer = new ig.Timer();

			// Start sandstorm.
			if (this.weather == 'sandstorm') {

				// Start sand-screen.
				this.sandscreen = ig.game.spawnEntity(EntitySandScreen, 0, 0, {});
			}
		},

		generatePos: function() {

			switch (this.weather) {

			case 'rain':

				var rainWidth = EntityRaindrop.prototype.size.x;
				var rainHeight = EntityRaindrop.prototype.size.y;

				// Random x value between "rainWidth" and "screen-top + screen-right - rainHeight".
				var x = ig.game.screen.x + Math.floor(Math.random() * (ig.system.width + ig.system.height - rainHeight - rainWidth)) + rainWidth;
				
				// Random y value - between 0 and half of rainHeight - above screen.
				var y = ig.game.screen.y - Math.floor(Math.random() * (rainHeight/2)) - rainHeight;

				if(x>ig.system.width) {

					offsetY = x - ig.system.width - ig.game.screen.x;
					x = x - offsetY;
					y = y + offsetY;
				}

				break;

			case 'sandstorm':

				// Random distance from left of screen.
				var x = ig.game.screen.x + Math.floor(Math.random() * (ig.system.width - 32));

				// Start below screen.
				var y = ig.game.screen.y + ig.system.height;

				break;
			}

			return {
				x: x,
				y: y
			};
		},

		update: function() {

			// Determine spawn rate.
			if (this.weather == 'sandstorm') rate = this.sandRate;
			else if (this.weather == 'rain') rate = this.rainRate;

			// Smoothly handle changes to rate.
			if (this.rate != rate) {

				// Reset timer.
				this.timer.set(0);

				// Remember new rate.
				this.rate = rate;
			}

			// How many should be spawned this very moment?
			var spawnCount = Math.floor(this.timer.delta() * rate);

			// Type of entity to spawn.
			var entityType = (this.weather == 'rain' ? EntityRaindrop : EntitySandCloud);

			// New entities need spawning?
			if (spawnCount != this.lastSpawned) {

				// Make up for missed spawns if too many frames passed.
				for (var i = 0; i < (spawnCount - this.lastSpawned); i++) {

					var position = this.generatePos();

					// Spawn entity.
					ig.game.spawnEntity(entityType, position.x, position.y, {});

				}

				// Keep track of spawn count.
				this.lastSpawned = spawnCount;
			}


			// Call parent.
			this.parent();
		}

	});
});