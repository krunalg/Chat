ig.module('game.entities.exit')

.requires('impact.entity')

.defines(function() {

	EntityExit = ig.Entity.extend({

		size: {
			x: 16,
			y: 16
		},

		// Name of map to load.
		map: null,

		// Integer ID of this exit entity.
		me: null,

		// Integer ID of exit to spawn at in next level.
		goTo: null,

		// Direction travelled through which triggers a zone.
		direction: null,

		// One of two types: door, floor
		type: null,

		// Load Weltmeister icon resource.
		animSheet: new ig.AnimationSheet('media/entity-icons.png', 16, 16),

		init: function(x, y, settings) {
			this.parent(x, y, settings);

			// Specify which icon to use.
			this.addAnim('weltmeister', 0.1, [0]);

			// Set the current icon.
			this.currentAnim = this.anims.weltmeister;
		},

		ready: function() {

			// Set up animations.
			switch (this.type) {

				// Set up animations for floor exits.
			case 'floor':

				// Get tilesize.
				var tilesize = ig.game.collisionMap.tilesize;

				// Load exit-arrows resource.
				this.animSheet = new ig.AnimationSheet('media/entities/exit/arrows.png', 16, 16);

				// Orient and position arrow by direction.
				switch (this.direction) {
				case 'left':
					this.addAnim('arrow', 0.5333, [2, 3]);
					this.offset = {
						x: tilesize,
						y: 0
					};
					break;
				case 'right':
					this.addAnim('arrow', 0.5333, [2, 3]);
					this.anims.arrow.flip.x = true;
					this.offset = {
						x: -tilesize,
						y: 0
					};
					break;
				case 'up':
					this.addAnim('arrow', 0.5333, [0, 1]);
					this.anims.arrow.flip.y = true;
					this.offset = {
						x: 0,
						y: tilesize
					};
					break;

				case 'down':
					this.addAnim('arrow', 0.5333, [0, 1]);
					this.offset = {
						x: 0,
						y: -tilesize
					};
					break;

					// Kill this entity if a direction is not set.
				default:
					console.debug("Exit entity at " + this.pos.x + "," + this.pos.y + " was not assign a direction and will now suicide.");
					this.kill();
					break;
				}

				break;

				// Set up animations for door exits.
			case 'door':

				// Align to map tiles.
				this.offset.y = 4;

				// Load door animation resource.
				this.animSheet = new ig.AnimationSheet('media/door-animations.png', 16, 20);

				// Add animations.
				this.addAnim('open', 0.0167, [0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 2, 2, 3], true);
				this.addAnim('opened', 0.0167, [3]);
				this.addAnim('close', 0.0167, [3, 3, 3, 3, 3, 2, 2, 2, 2, 2, 1, 1, 1, 1, 1, 1, 0], true);
				this.addAnim('closed', 0.0167, [0]);
				break;

				// Kill this entity if no type was specified.
			default:
				console.debug("Exit entity at " + this.pos.x + "," + this.pos.y + " was not assigned a type and will suicide.");
				this.kill();
				break;
			}

			// Prevent Weltmeister icon from showing in game.
			this.currentAnim = null;
		},

		startAnim: function() {

			// Check if animation has been disabled from within Weltmeister.
			if (this.animation != 'off') {

				// Animate the exit based on its type.
				switch (this.type) {

				case 'door':

					// Debug message.
					console.debug('Opening door.');

					// Set current animation.
					this.currentAnim = this.anims.open;

					break;

				case 'floor':

					// Debug message.
					console.debug('Turning on exit arrow.');

					// Set current animation.
					this.currentAnim = this.anims.arrow;

					break;
				}
			}
		},

		stopAnim: function() {
			if (this.currentAnim != null) {
				console.debug('Turning off exit arrow.');
				this.currentAnim = null;
			}
		},

		trigger: function() {
			console.debug('Changing to map: ' + this.map);
			ig.game.zone(this.map, this.goTo);
		},

		update: function() {
			this.parent();
		}


	});
});