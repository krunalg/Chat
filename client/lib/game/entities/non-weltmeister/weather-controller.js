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
			if (this.weather=='sandstorm') {

				// Start sand-screen.
				this.sandscreen = ig.game.spawnEntity(EntitySandScreen, 0, 0, {});
			}
		},

		update: function() {

			if(this.weather=='sandstorm') rate = this.sandRate;
			else if(this.weather=='rain') rate = this.rainRate;

			// Smoothly handle changes to rate.
			if(this.rate!=rate) {

				// Reset timer.
				this.timer.set(0);

				// Remember new rate.
				this.rate = rate;
			}

			// How many should be spawned this very moment?
			var spawnCount = Math.floor(this.timer.delta() * rate);

			// Rain
			if (this.weather=='rain') {

				if( spawnCount != this.lastSpawned ) {

					// Make up for missed spawns if too many frames passed.
					for(var i=0; i< (spawnCount - this.lastSpawned); i++) {

						// Random distance from left of screen.
						var x = ig.game.screen.x + Math.floor(Math.random() * (ig.system.width + ((1 / 3) * ig.system.height) - 30)) + 30;

						// Random distance above top of screen.
						var y = ig.game.screen.y - Math.floor(Math.random() * 16) - 32;

						// Spawn a raindrop.
						ig.game.spawnEntity(EntityRaindrop, x, y, {});

					}

					this.lastSpawned = spawnCount;
				}
			}

			// Sandstorm
			else if (this.weather=='sandstorm') {

				// Random distance from left of screen.
				var x = ig.game.screen.x + Math.floor(Math.random() * (ig.system.width - 32));

				// Start below screen.
				var y = ig.game.screen.y + ig.system.height;

				if( spawnCount != this.lastSpawned ) {

					// Spawn a raindrop.
					ig.game.spawnEntity(EntitySandCloud, x, y, {});

					this.lastSpawned = spawnCount;
				}
			}

			// Call parent.
			this.parent();
		}

	});
});