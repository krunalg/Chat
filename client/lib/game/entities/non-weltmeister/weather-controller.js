ig.module('game.entities.non-weltmeister.weather-controller')

.requires('impact.entity')

.defines(function() {

	EntityWeatherController = ig.Entity.extend({


		// How many sand clouds to spawn per second.
		sandRate: 2,

		// How many rain drops to spawn per second.
		rainRate: 100,

		// Used to accomodate rate changes.
		rate: 0,

		// Timer for spawning entities.
		timer: null,

		// Used to prevent spawning too quickly.
		lastSpawned: -1,

		// Type of weather effect.
		weather: null,

		// Reference to entity.
		screenEntity: undefined,

		init: function(x, y, settings) {
			this.parent(x, y, settings);

			// Start spawn timer.
			this.timer = new ig.Timer();

			// Start sandstorm.
			if (this.weather == 'sandstorm') {

				// Start sand-screen.
				this.screenEntity = ig.game.spawnEntity(EntitySandScreen, 0, 0, {});
			}
			else if (this.weather=='ashes') {

				// Start falling ashes.
				this.screenEntity = ig.game.spawnEntity(EntityAshScreen, 0, 0, {});
			}
		},

		generatePos: function() {

			switch (this.weather) {

			case 'rain':

				// Entity size.
				var rainWidth = EntityRainDrop.prototype.size.x;
				var rainHeight = EntityRainDrop.prototype.size.y;

				// Random x value between "rainWidth" and "screen-top + screen-right - rainHeight".
				var x = ig.game.screen.x + Math.floor(Math.random() * (ig.system.width + ig.system.height - rainHeight - rainWidth)) + rainWidth;
				
				// Random y value - between 0 and half of rainHeight - above screen.
				var y = ig.game.screen.y - Math.floor(Math.random() * (rainHeight/2)) - rainHeight;

				// Wrap x into the y axis.
				if(x> ig.game.screen.x + ig.system.width) {

					// The distance beyond right edge of screen.
					offsetY = x - ig.system.width - ig.game.screen.x;
					
					// Set x to right screen edge.
					x = x - offsetY;

					// Wrap offset into y pos.
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

		kill: function() {

			// Entity needs removal?
			if (typeof this.screenEntity != 'undefined') {

				// Remove sceen entity.
				this.screenEntity.kill();
			}

			// Call parent.
			this.parent();
		}

		update: function() {

			if (this.weather == 'rain' || this.weather == 'sandstorm') {

				// Determine spawn rate.
				var rate = (this.weather == 'rain' ? this.rainRate : this.sandRate);

				// Type of entity to spawn.
				var entityType = (this.weather == 'rain' ? EntityRainDrop : EntitySandCloud);

				// Smoothly handle changes to rate.
				if (this.rate != rate) {

					// Reset timer.
					this.timer.set(0);

					// Remember new rate.
					this.rate = rate;
				}

				// How many should be spawned this very moment?
				var spawnCount = Math.floor(this.timer.delta() * rate);

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
			}

			// Call parent.
			this.parent();
		}

	});
});