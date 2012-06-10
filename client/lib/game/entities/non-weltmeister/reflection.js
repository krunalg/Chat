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

			// /*
			// Inject custom draw function into image class.
			ig.Image.inject({
				draw: function( targetX, targetY, sourceX, sourceY, width, height, flipX, flipY ) {
					if( !this.loaded ) { return; }
					
					var scale = ig.system.scale;
					sourceX = sourceX ? sourceX * scale : 0;
					sourceY = sourceY ? sourceY * scale : 0;
					width = (width ? width : this.width) * scale;
					height = (height ? height : this.height) * scale;
					
					var scaleX = flipX ? -1 : 1;
					var scaleY = flipY ? -1 : 1;
					
					if( flipX || flipY ) {
						ig.system.context.save();
						ig.system.context.scale( scaleX, scaleY );
					}
					
					ig.system.context.drawImage( 
						this.data, sourceX, sourceY, width, height,
						ig.system.getDrawPos(targetX) * scaleX - (flipX ? width : 0), 
						ig.system.getDrawPos(targetY) * scaleY - (flipY ? height : 0),
						width, height
					);

					if( flipX || flipY ) {
						ig.system.context.restore();
					}
					
					ig.Image.drawCount++;
				},
			});
			// */
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
				
				var sheetWidth = this.currentAnim.sheet.image.width;
				var sheetHeight = this.currentAnim.sheet.image.height;
				var tileWidth = this.currentAnim.sheet.width;
				var tileHeight = this.currentAnim.sheet.height;
				var tile = this.currentAnim.tile;
				var sourceX = (tile * tileWidth) % sheetWidth;
				var sourceY = Math.floor((tile * tileWidth) / sheetWidth) * tileHeight;
				var drawX = this.pos.x - this.offset.x - ig.game._rscreen.x;
				var drawY = this.pos.y - this.offset.y - ig.game._rscreen.y;
				var flipX = this.currentAnim.flip.x;
				var flipY = this.currentAnim.flip.y;
				var width = this.currentAnim.sheet.width;
				var height = this.currentAnim.sheet.height;

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
						this.currentAnim.sheet.image.draw(
							(flipX ? drawX + (width / 2) : drawX),
							drawY,
							sourceX,
							sourceY,
							(width / 2) + 1,
							height,
							flipX,
							flipY
						);

						this.currentAnim.sheet.image.draw(
							(flipX ? drawX : drawX + (width / 2) + 1 ),
							drawY,
							sourceX + (width / 2),
							sourceY,
							width / 2,
							height,
							flipX,
							flipY
						);
						break;

					// Shift left-half to the right.
					case 2:

						break;
						
						
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