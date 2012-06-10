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

		// Used to animate distortion effect.
		distortionTimer: null,

		// Current state of distortion (0-2).
		distortionFrame: 0,

		// Entity to follow.
		follow: null,

		init: function(x, y, settings) {
			this.parent(x, y, settings);

			this.distortionTimer = new ig.Timer();
		},

		draw: function() {
			
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
			if( this.currentAnim ) {
				
				switch(this.distortionFrame) {
					
					// Draw normal.
					case 0:
						this.currentAnim.draw(
							this.pos.x - this.offset.x - ig.game._rscreen.x,
							this.pos.y - this.offset.y - ig.game._rscreen.y
						);
						break;

					// Shift right-half to the right.
					case 1:
						var tilesheetWidth = this.currentAnim.sheet.image.width;
						var tilesheetHeight = this.currentAnim.sheet.image.height;
						var tileXinTilesheet =            (this.currentAnim.tile * this.currentAnim.sheet.width) % this.currentAnim.sheet.image.width;
						var tileYinTilesheet = Math.floor( (this.currentAnim.tile * this.currentAnim.sheet.width) / this.currentAnim.sheet.image.width) * this.currentAnim.sheet.height;

						var drawX = this.pos.x - this.offset.x - ig.game._rscreen.x;
						var drawY = this.pos.y - this.offset.y - ig.game._rscreen.y;

						firstHalfWidth = (this.currentAnim.sheet.width/2) + 1;

						this.currentAnim.sheet.image.draw(
							drawX,
							drawY,
							tileXinTilesheet,
							tileYinTilesheet,
							firstHalfWidth,
							this.currentAnim.sheet.height
						);

						this.currentAnim.sheet.image.draw(
							drawX + firstHalfWidth,
							drawY,
							tileXinTilesheet + firstHalfWidth - 1,
							tileYinTilesheet,
							this.currentAnim.sheet.width/2,
							this.currentAnim.sheet.height
						);
				}
				
			}

			// Restore vertical flip.
			this.currentAnim.flip.y = false;
		},

		update: function() {
			
			// Kill this entity if player no longer exists.
			if(this.follow._killed) this.kill();

			// Update distortion effect.
			//this.distortionFrame = Math.floor(this.distortionTimer.delta()) %3;
			this.distortionFrame = 1;

			// Parent call.
			this.parent();
		}


	});
});