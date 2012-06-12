ig.module('game.entities.non-weltmeister.reflection')

.requires('impact.entity')

.defines(function() {

	EntityReflection = ig.Entity.extend({

		size: {
			x: 16,
			y: 16
		},
		offset: {
			x: 8,
			y: -15
		},

		// Used to calculate frames.
		timer: null,

		// Current position in sequence.
		frame: 0,

		// Order of distortion animation.
		sequence: [0,0,0,1,1,1,1,1,0,0,0,2,2,2,2,2],

		// How long each frame lasts.
		frameTime: 0.05,

		// Entity to follow.
		follow: null,

		// Used to keep entity alive briefly before killing.
		killTimer: null,

		// Is set to true when markForDeath() is called.
		markedForDeath: false,

		init: function(x, y, settings) {
			this.parent(x, y, settings);

			// Create timer for frames.
			this.timer = new ig.Timer();

			// Create timer for removing entity.
			this.killTimer = new ig.Timer();

			// Adds the flipX and flipY parameters to ig.Image.draw()
			ig.Image.inject({
				draw: function(targetX, targetY, sourceX, sourceY, width, height, flipX, flipY) {
					if (!this.loaded) {
						return;
					}

					var scale = ig.system.scale;
					sourceX = sourceX ? sourceX * scale : 0;
					sourceY = sourceY ? sourceY * scale : 0;
					width = (width ? width : this.width) * scale;
					height = (height ? height : this.height) * scale;

					var scaleX = flipX ? -1 : 1;
					var scaleY = flipY ? -1 : 1;

					if (flipX || flipY) {
						ig.system.context.save();
						ig.system.context.scale(scaleX, scaleY);
					}

					ig.system.context.drawImage(
					this.data, sourceX, sourceY, width, height, ig.system.getDrawPos(targetX) * scaleX - (flipX ? width : 0), ig.system.getDrawPos(targetY) * scaleY - (flipY ? height : 0), width, height);

					if (flipX || flipY) {
						ig.system.context.restore();
					}

					ig.Image.drawCount++;
				},
			});
		},

		// Start count-down until this entity will be killed.
		markForDeath: function() {
			
			// Set the timer.
			this.killTimer.set(3);

			// Allow removal of entity.
			this.markedForDeath = true;
		},

		// Save this entity from being killed.
		revive: function() {
			this.markedForDeath = false;
		},

		draw: function(reallyDraw) {

			// Only draw when the 'reallyDraw' param is true, 
			// so it ignores the "normal" draw call.
			// Additionally, draw only if we shouldn't hide instead
			if (reallyDraw) {

				// Check that we have entity to follow.
				if (this.follow) {

					// Copy coordinates of player.
					this.pos = this.follow.pos;

					// Copy animation of player.
					this.currentAnim = this.follow.currentAnim;

					// Flip vertically.
					this.currentAnim.flip.y = true;

				}

				// Remove reflection if the player does not exist.
				else {

					// Debug message.
					console.debug("Reflection entity exists but player does not and will now suicide.");

					// Kill entity.
					this.kill();
				}

				// Draw entity.
				if (this.currentAnim) {

					var tile = this.currentAnim.tile;
					var tileWidth = this.currentAnim.sheet.width;
					var tileHeight = this.currentAnim.sheet.height;
					var sheetWidth = this.currentAnim.sheet.image.width;
					var sheetHeight = this.currentAnim.sheet.image.height;
					var targetX = this.pos.x - this.offset.x - ig.game._rscreen.x;
					var targetY = this.pos.y - this.offset.y - ig.game._rscreen.y;
					var sourceX = (tile * tileWidth) % sheetWidth;
					var sourceY = Math.floor((tile * tileWidth) / sheetWidth) * tileHeight;
					var flipX = this.currentAnim.flip.x;
					var flipY = this.currentAnim.flip.y;

					switch (this.state) {

					// Draw normal.
					case 0:
						this.currentAnim.draw(
						targetX, targetY);
						break;

					// Shift right-half to the right.
					case 1:
						this.currentAnim.sheet.image.draw(
						(flipX ? targetX + (tileWidth / 2) : targetX), targetY, sourceX, sourceY, (tileWidth / 2) + 1, tileHeight, flipX, flipY);

						this.currentAnim.sheet.image.draw(
						(flipX ? targetX : targetX + (tileWidth / 2) + 1), targetY, sourceX + (tileWidth / 2), sourceY, tileWidth / 2, tileHeight, flipX, flipY);
						break;

					// Shift left-half to the right.
					case 2:
						this.currentAnim.sheet.image.draw(
						(flipX ? targetX + (tileWidth / 2) : targetX + 1), targetY, sourceX, sourceY, tileWidth / 2, tileHeight, flipX, flipY);

						this.currentAnim.sheet.image.draw(
						(flipX ? targetX : targetX + (tileWidth / 2)), targetY, sourceX + (tileWidth / 2), sourceY, tileWidth / 2, tileHeight, flipX, flipY);
						break;
					}

				}

				// Restore vertical flip.
				this.currentAnim.flip.y = false;
			}
		},

		update: function() {

			// Check if entity is no longer needed.
			if ( (this.markedForDeath && this.killTimer.delta() >= 0) || this.follow._killed) 
			{
				// Free up resources.
				this.kill();
			}

			// Get total frames elapsed.
			var frameTotal = Math.floor(this.timer.delta() / this.frameTime);
			
			// Where in the sequence are we?
			this.frame = frameTotal % this.sequence.length;
			
			// Get distortion state from sequence.
			this.state = this.sequence[ this.frame ];

			// Parent call.
			this.parent();
		}


	});
});