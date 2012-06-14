ig.module('game.entities.non-weltmeister.raindrop')

.requires('impact.entity')

.defines(function() {

	EntityRaindrop = ig.Entity.extend({

		size: {
			x: 16,
			y: 32
		},

		// Load image resource.
		animSheet: new ig.AnimationSheet('media/rs.raindrop.png', 16, 32),

		init: function(x, y, settings) {
			this.parent(x, y, settings);

			// Set up animation.
			this.addAnim('fall', 1, [0], true);
			this.addAnim('hitGround', (1 / 60), [1, 1, 1, 2, 2, 3, 3, 3], true);

			// Set current animation.
			this.currentAnim = this.anims.fall;

			// Set velocity.
			this.maxVel.x = this.vel.x = -13 * 30;
			this.maxVel.y = this.vel.y = 26 * 30;

			// Moment that entity goes off-screen.
			this.maxTimeX = ( ig.game.screen.x - this.pos.x ) / this.vel.x
			this.maxTimeY = ( ig.system.height - this.pos.y + ig.game.screen.y - this.size.y) / this.vel.y;
			
			// Which happens sooner?
			this.maxTime = (this.maxTimeX > this.maxTimeY ? this.maxTimeY : this.maxTimeX);

			this.hitTimer = new ig.Timer();
			this.hitTimer.set( Math.random() * this.maxTime );
			
		},

		handleMovementTrace: function(res) {
			// This completely ignores the trace result (res) and always
			// moves the entity according to its velocity
			this.pos.x += this.vel.x * ig.system.tick;
			this.pos.y += this.vel.y * ig.system.tick;
		},

		update: function() {

			if( this.hitTimer.delta() >= 0 && this.currentAnim == this.anims.fall)
			{
				this.vel.x = this.vel.y = 0;
				this.currentAnim = this.anims.hitGround;
				this.currentAnim.rewind();
			} 

			else if ( this.currentAnim == this.anims.hitGround )
			{
				// Check if animation has finished.
				if (this.currentAnim.loopCount >= 1) {
					// Free up resources.
					this.kill();
				}
			}
				
			// Call parent.
			this.parent();
		}

	});
});